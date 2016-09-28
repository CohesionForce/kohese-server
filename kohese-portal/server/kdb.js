/**
 * 
 */

var fs = require('fs');
var path = require('path');

console.log("::: Begin KDB File Load");

var kdbFS = require('./kdb-fs.js');
var kdbRepo = require('./kdb-repo.js');
module.exports.kdbRepo = kdbRepo;

var jsonExt = /\.json$/;

var ItemProxy = require('../common/models/item-proxy.js');
module.exports.ItemProxy = ItemProxy;

var kdbStore = {
    ids: {},
    models: {}
  };

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function retrieveDataForMemoryConnector(){

  var lbMemConnectorData = {
      ids: JSON.parse(JSON.stringify(kdbStore.ids)),
      cache: {}
  };
 
  for(var model in kdbStore.models) {
    if (model !== "Analysis") {
      lbMemConnectorData.cache[model] = JSON.parse(JSON.stringify(kdbStore.models[model]));
    }
  } 

  // Since we do not store the Analysis artifacts in loopback, remove them
  lbMemConnectorData.ids.Analysis=0;
  lbMemConnectorData.cache.Analysis = {};
  
  return lbMemConnectorData;
}

module.exports.retrieveDataForMemoryConnector = retrieveDataForMemoryConnector; 

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function determineRepoStoragePath(repo){
  var repoStoragePath;
  if(repo && repo.item.id !== 'ROOT'){
    console.log("::: Repository => " + repo.item.name);
    if(repo.repoPath){
      repoStoragePath = repo.repoPath.replace("/Root.json", "");
      repoStoragePath = repoStoragePath.replace(jsonExt, ""); 
    } else {
      // Must be a new repo
      var parentRepo = repo.parentProxy.getRepositoryProxy();
      var parentRepoStoragePath = determineRepoStoragePath(parentRepo);
      var repoDirPath = parentRepoStoragePath + "/Repository/" + repo.item.id;
      repo.repoPath = repoDirPath + ".json";
      console.log("::: >>> Creating new repo path: " + repoDirPath);

      repoStoragePath = repoDirPath;
    }
  } else {
    console.log("::: Repository => KDB Data Store");
    repoStoragePath = koheseKDBDirPath;
  }
  return repoStoragePath;
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function retrieveModelInstance(modelName, modelInstanceId) {
  console.log("::: Retrieving " + modelName + " - " + modelInstanceId);
  var modelStore = kdbStore.models[modelName];
  var instance;

  if (modelStore[modelInstanceId]) {
    instance = JSON.parse(modelStore[modelInstanceId]);
  }
  return instance;
}

module.exports.retrieveModelInstance = retrieveModelInstance;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function storeModelInstance(modelName, modelInstance){

  var proxy = ItemProxy.getProxyFor(modelInstance.id);
  var isNewItem = false;
  
  if(modelName !== "Analysis"){
    var strippedInstance = JSON.parse(JSON.stringify(modelInstance));
    if (proxy){
      proxy.updateItem(modelName, strippedInstance);
    } else {
      proxy = new ItemProxy(modelName, strippedInstance);
      isNewItem = true;
    }
    
    // Delete any associated analysis
    var analysisStore = kdbStore.models["Analysis"];
    if(analysisStore[modelInstance.id]){
      removeModelInstance("Analysis", modelInstance.id);
    }
  }

  var repo = proxy.getRepositoryProxy();    
  var repoStoragePath = determineRepoStoragePath(repo);
  
  console.log(">>> Repo storage: " + repoStoragePath);
  var filePath = repoStoragePath + "/" + modelName + "/" + modelInstance.id + ".json";

  if (modelName === "Repository"){
    var parentRepo = proxy.parentProxy.getRepositoryProxy();
    var parentRepoStoragePath = determineRepoStoragePath(parentRepo);
    var repoMountFilePath = parentRepoStoragePath + "/Repository/" + modelInstance.id + ".json.mount";
    var repoMountData = {
      id: modelInstance.id,
      name: modelInstance.name,
      parentId: modelInstance.parentId,
    };
    
    console.log("::: Repo Mount Information");
    console.log(repoMountData);
    kdbFS.storeJSONDoc(repoMountFilePath, repoMountData);
    mountList[repoMountData.id] = {'repoStoragePath': repoStoragePath};
    updateMountFile();
  
    repoStoragePath = determineRepoStoragePath(proxy);
    console.log("::: rSP: " + repoStoragePath);
    
    filePath = repoStoragePath + "/Root.json";
    var repoRootData = JSON.parse(JSON.stringify(modelInstance));
    delete repoRootData.parentId;
    delete repoRootData.repoStoragePath;
    delete repoRootData.mounted;
    checkAndCreateDir(repoStoragePath);
    kdbFS.storeJSONDoc(filePath, repoRootData);
    
    if (isNewItem){
        validateRepositoryStructure(repoStoragePath);
      }

  } else {

    if(modelName !== "Analysis" && filePath !== proxy.repoPath){
      console.log("}}} Old: " + proxy.repoPath);
      if (proxy.repoPath){
        kdbFS.removeFile(proxy.repoPath);      
      }
      console.log("}}} New: " + filePath);
      proxy.repoPath = filePath;
    }
    
    kdbFS.storeJSONDoc(filePath, modelInstance);

  }

  var modelStore = kdbStore.models[modelName];
  modelStore[modelInstance.id] = JSON.stringify(modelInstance);
}

module.exports.storeModelInstance = storeModelInstance;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function removeModelInstance(modelName, instanceId){
  var proxy = ItemProxy.getProxyFor(instanceId);

  if(modelName === "Analysis"){
    var repo = proxy.getRepositoryProxy();    
    var repoStoragePath = determineRepoStoragePath(repo);
    var filePath = repoStoragePath + "/" + modelName + "/" + instanceId + ".json";

    kdbFS.removeFile(filePath); 
  } else if (modelName === 'Repository') {
      // Delete any associated analysis
      var analysisStore = kdbStore.models["Analysis"];
      if(analysisStore[instanceId]){
        removeModelInstance("Analysis", instanceId);
      }
      
      var parentRepo = proxy.parentProxy.getRepositoryProxy();
      var parentRepoPath = mountList[parentRepo.item.id].repoStoragePath;
      
      kdbFS.removeFile(path.join(parentRepoPath, 'Repository', proxy.item.id + '.json.mount'));
      delete mountList[proxy.item.id];
      proxy.deleteItem();
      updateMountFile();
      
      // Should remove the proxies and modelStore instances of all the children, but not delete from disk.
      
  } else {
    // Delete any associated analysis
    var analysisStore = kdbStore.models["Analysis"];
    if(analysisStore[instanceId]){
      removeModelInstance("Analysis", instanceId);
    }

    kdbFS.removeFile(proxy.repoPath);
    proxy.deleteItem();
  }
  
  var modelStore = kdbStore.models[modelName];
  delete modelStore[instanceId];
}

module.exports.removeModelInstance = removeModelInstance;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function checkAndCreateDir(dirName, ignoreJSONFiles) {
  kdbFS.createDirIfMissing(dirName);
  if(ignoreJSONFiles){
    kdbFS.createGITIgnoreJSONIfMissing(dirName + "/.gitignore");
  } else {
    kdbFS.createEmptyFileIfMissing(dirName + "/.gitignore");    
  }
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function validateRepositoryStructure (repoDirPath) {
  checkAndCreateDir(repoDirPath);

  var modelDirList = kdbFS.getRepositoryFileList(repoDirPath);
  
  // Remove model directories that are no longer needed
  for (var dirIdx = 0; dirIdx < modelDirList.length; dirIdx++) {
    var modelDirName = modelDirList[dirIdx];
    if (!modelConfig[modelDirName]) {
      console.log("::: Removing stored directory for " + modelDirName);
      kdbFS.deleteFolderRecursive(repoDirPath + "/" + modelDirName);
    }
  }
  
  // Check for the model directories
  for(var modelName in modelConfig){
    var modelDirPath = repoDirPath + "/" + modelName;
    var ignoreJSONFiles = (modelName === "Analysis");
    checkAndCreateDir(modelDirPath, ignoreJSONFiles);
  }
  
  modelDirList = kdbFS.getRepositoryFileList(repoDirPath);
  
  for(var modelIdx = 0; modelIdx < modelDirList.length; modelIdx++){
    var modelName = modelDirList[modelIdx];
    var modelDirPath = repoDirPath + "/" + modelName;
    var modelStore = kdbStore.models[modelName];
    var fileList;
    
    if(modelName === 'Repository') {
        fileList = kdbFS.getRepositoryFileList(modelDirPath, /\.mount$/);
        for(var fileIdx = 0; fileIdx < fileList.length; fileIdx++) {
            var itemPath = modelDirPath + "/" + fileList[fileIdx];
            var repoMount = kdbFS.loadJSONDoc(itemPath);
            
            console.log("::: Validating mounted repository: " + repoMount.name);
            
            // Check mountFile for the mount path or use a .mount file if necessary
            var subRepoDirPath;
            if(mountList[repoMount.id]) {
                subRepoDirPath = mountList[repoMount.id].repoStoragePath;
            } else if (repoMount.repoStoragePath){
                // Does not exist in mountList so need to add and rewrite it
                mountList[repoMount.id] = {};
                mountList[repoMount.id].repoStoragePath = repoMount.repoStoragePath;
                subRepoDirPath = repoMount.repoStoragePath;
                updateMountFile();
            } else {
                throw new Error('Cannot find mount path information for ' + itemPath);
            }
            
            // Attempt to mount the repository. If unable then make it apparent in the client.
            var repoCanBeMounted = true;
            var repoRoot;
            
            try {
                repoRoot = kdbFS.loadJSONDoc(path.join(subRepoDirPath, 'Root.json'));
            } catch(err) {
                repoCanBeMounted = false;
                console.log('!!! Unable to mount repo ' + repoMount.name);
                delete repoMount.repoStoragePath;
                mountList[repoMount.id].mounted = false;
                repoMount.mounted = false;
                repoMount.name = 'Error: ' + repoMount.name;
                repoMount.description = 'Error: Unable to load ' + subRepoDirPath;
                var proxy = new ItemProxy(modelName, repoMount);
                //proxy.repoPath = itemPath;
                modelStore[repoMount.id] = JSON.stringify(repoMount);
            }
            
            if(repoCanBeMounted) {
                if(repoMount.name !== repoRoot.name) {
                    console.log('::: Updating mount file to match Root.json');
                    repoMount.name = repoRoot.name;
                    kdbFS.storeJSONDoc(itemPath, repoMount);
                }
                // Check to see if it's been mounted already
                var proxy;
                if(mountList[repoMount.id].mount) {
                    proxy = ItemProxy.getProxyFor(repoMount.id);
                    repoRoot.parentId = repoMount.parentId;
                    proxy.updateItem('Repository', repoRoot);
                    modelStore[repoMount.id] = JSON.stringify(repoRoot);
                } else {
                    repoRoot.parentId = repoMount.parentId;
                    mountList[repoMount.id].mounted = true;
                    repoRoot.mounted = true;
                    proxy = new ItemProxy(modelName, repoRoot);
                    proxy.repoPath = path.join(subRepoDirPath, 'Root.json');
                    validateRepositoryStructure(subRepoDirPath);
                    modelStore[repoMount.id] = JSON.stringify(repoRoot);
                }
            }
        }
    } else {
        fileList = kdbFS.getRepositoryFileList(modelDirPath, jsonExt);
        for(var fileIdx = 0; fileIdx < fileList.length; fileIdx++) {
          var itemPath = modelDirPath + "/" + fileList[fileIdx];
          var itemRow = kdbFS.loadJSONDoc(itemPath);
          
          if(modelName !== "Analysis"){
            var proxy = new ItemProxy(modelName, itemRow);
            proxy.repoPath = itemPath;
          }
          
          modelStore[itemRow.id] = JSON.stringify(itemRow);
          
        }    
    }
  kdbStore.ids[modelName] += fileList.length;
  }
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function updateMountFile() {
    var mountFile = JSON.parse(JSON.stringify(mountList));
    for(var id in mountFile) {
        delete mountFile[id].mounted;
    }
    kdbFS.storeJSONDoc(mountFilePath, mountFile);
}

//////////////////////////////////////////////////////////////////////////
// main processing
//////////////////////////////////////////////////////////////////////////

// Read the model config
var modelConfig = kdbFS.loadJSONDoc("server/model-config.json");

// Ignore the loopback _meta
if (modelConfig._meta) {
  delete modelConfig._meta;
}

console.log(modelConfig);

var modelKinds = Object.keys(modelConfig);
modelKinds.sort();
console.log("::: ModelKinds: " + modelKinds);

for(var modelKindIdx in modelKinds){
  var modelKind = modelKinds[modelKindIdx];
  console.log("::: ModelKind: " + modelKind);
  kdbStore.ids[modelKind] = 0;
  kdbStore.models[modelKind] = {};
}

console.log("::: Validating Repository Structure");

var kdbDirPath = "kdb";
checkAndCreateDir(kdbDirPath);
checkAndCreateDir(path.join(kdbDirPath, 'kohese-kdb'));
//TODO: checkAndCreateDir does not handle cases such as test1/test2 if test1 does not exist.
//Paths may be provided via arguments when starting via -kdb=PATH
var baseRepoPath = 'kohese-kdb';
for (var i = 2; i < process.argv.length; i++) {
    var arg = process.argv[i].split('=');
    if(arg[0] === '-kdb' && arg[1] !=='') {
        baseRepoPath = arg[1];
        break;
    }
}

var koheseKDBDirPath = path.join(kdbDirPath, baseRepoPath);
checkAndCreateDir(koheseKDBDirPath);

// Check to see if a Root.json exists
try {
    kdbFS.loadJSONDoc(path.join(koheseKDBDirPath, 'Root.json'));
} catch(err) {
    var uuid = require('node-uuid');
    var newRoot = {id: uuid.v1(), name: 'Root of ' + koheseKDBDirPath, description: 'Root of a repository.'};
    kdbFS.storeJSONDoc(path.join(koheseKDBDirPath, 'Root.json'), newRoot);
}

// Check and process mounts.json
var mountList = {};
var mountFilePath = path.join(koheseKDBDirPath, 'mounts.json');
try {
    mountList = kdbFS.loadJSONDoc(mountFilePath);
} catch(err) {
    // Do nothing; the mount list will get written when validating if necessary
}

// Create/validate root repo structure
validateRepositoryStructure(koheseKDBDirPath);

// Validate the repositories listed inside the mount file
for(var id in mountList) {
    if(!mountList[id].mounted && mountList[id].repoStoragePath) {
        validateRepositoryStructure(mountList[id].repoStoragePath);
    }
}

// Load corresponding git repositories
var repoList = {};
module.exports.repoList = repoList;

kdbRepo.openRepo(koheseKDBDirPath, repoList, 'ROOT');

// Initialize nodegit repo-open promises
for(var id in mountList) {
    if(mountList[id].mounted && mountList[id].repoStoragePath) {
        kdbRepo.openRepo(mountList[id].repoStoragePath, repoList, id);
    }
}

var rootProxy = ItemProxy.getRootProxy();
rootProxy.repoPath = koheseKDBDirPath;
console.log("--- Root descendant count: " + rootProxy.descendantCount);
for(var childIdx in rootProxy.children){
  var childProxy = rootProxy.children[childIdx];
  console.log("--- Child descendant count of " + childProxy.item.name + ": " + childProxy.descendantCount);  
}

var kdbModel = require('./kdb-model.js');
kdbFS.storeJSONDoc(kdbDirPath + "/modelDef.json", kdbModel.modelDef);

console.log("::: End KDB File Load");
