/**
 * 
 */

console.log("::: Begin KDB File Load");

var kdbFS = require('./kdb-fs.js');
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
function determineRepoStoragePath(repo){
  var repoStoragePath;
  if(repo){
    console.log("::: Repository => " + repo.item.name);
    if(repo.repoPath){
      repoStoragePath = repo.repoPath.replace("/Root.json", "");
      repoStoragePath = repo.repoPath.replace(jsonExt, "");      
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
    repoStoragePath = exportDirPath;
  }
  return repoStoragePath;
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function retrieveModelInstance(modelName, modelInstanceId) {
  console.log("::: Retrieving " + modelName + " - " + modelInstanceId)
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

  repo = proxy.getRepositoryProxy();    
  var repoStoragePath = determineRepoStoragePath(repo);
  
  console.log(">>> Repo storage: " + repoStoragePath);
  var filePath = repoStoragePath + "/" + modelName + "/" + modelInstance.id + ".json";

  if (modelName === "Repository"){
    var parentRepo = proxy.parentProxy.getRepositoryProxy();
    var parentRepoStoragePath = determineRepoStoragePath(parentRepo);
    var repoMountFilePath = parentRepoStoragePath + "/" + modelName + "/" + modelInstance.id + ".json";
    var repoMountData = {
      id: modelInstance.id,
      parentId: modelInstance.parentId,
      repoStoragePath : repoStoragePath,
    };
    
    console.log("::: Repo Mount Information");
    console.log(repoMountData);
    kdbFS.storeJSONDoc(repoMountFilePath, modelInstance);
    kdbFS.storeJSONDoc(repoMountFilePath + ".mount", repoMountData);
  
    repoStoragePath = determineRepoStoragePath(proxy);
    console.log("::: rSP: " + repoStoragePath);
    
    if (isNewItem){
      validateRepositoryStructure(repoStoragePath);
    }

    filePath = repoStoragePath + "/Root.json";
    var repoRootData = modelInstance;
    delete repoRootData.parentId;
    delete repoRootData.repoStoragePath;
    kdbFS.storeJSONDoc(filePath, repoRootData);

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
    repo = proxy.getRepositoryProxy();    
    var repoStoragePath = determineRepoStoragePath(repo);
    var filePath = repoStoragePath + "/" + modelName + "/" + instanceId + ".json";

    kdbFS.removeFile(filePath); 
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
    kdbFS.createGITIgnoreJSONIfMissing(dirName + "/.gitignore")
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
  
  // Ignore the Root.json file if it exists
  var rootIdx = modelDirList.indexOf("Root.json");
  if (rootIdx > -1){
    modelDirList.splice(rootIdx, 1);
  }
  
  // Remove model directories that are no longer needed
  for (var dirIdx in modelDirList) {
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

  // Ignore the Root.json file if it exists
  rootIdx = modelDirList.indexOf("Root.json");
  if (rootIdx > -1){
    modelDirList.splice(rootIdx, 1);
  }
  
  for(var modelIdx in modelDirList){
    var modelName = modelDirList[modelIdx];
    var modelDirPath = repoDirPath + "/" + modelName;
    var modelStore = kdbStore.models[modelName];
    var fileList = kdbFS.getRepositoryFileList(modelDirPath, jsonExt);
    for(var fileIdx in fileList) {
      var itemPath = modelDirPath + "/" + fileList[fileIdx];
      var itemRow = kdbFS.loadJSONDoc(itemPath);
      
      if(modelName !== "Analysis"){
        var proxy = new ItemProxy(modelName, itemRow);
        proxy.repoPath = itemPath;
      }
      
      modelStore[itemRow.id] = JSON.stringify(itemRow);
      if(modelName === "Repository"){
        console.log("::: Validating mounted repository: " + itemRow.name);
        var subRepoDirPath = modelDirPath + "/" + itemRow.id;
        validateRepositoryStructure(subRepoDirPath);
      }
    }
    kdbStore.ids[modelName] += fileList.length;
  }
}

//////////////////////////////////////////////////////////////////////////
// main processing
//////////////////////////////////////////////////////////////////////////

// Read the model config
modelConfig = kdbFS.loadJSONDoc("server/model-config.json");

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

console.log("::: Validating Repository Structure")

var kdbDirPath = "kdb";
checkAndCreateDir(kdbDirPath);

var koheseKDBDirPath = kdbDirPath + "/kohese-kdb";
checkAndCreateDir(koheseKDBDirPath);

var exportDirPath = koheseKDBDirPath + "/export";
validateRepositoryStructure(exportDirPath);

kdbFS.storeJSONDoc(kdbDirPath + "/kdbStore.json", kdbStore);
var rootProxy = ItemProxy.getRootProxy();
//rootProxy.dumpProxy();
console.log("--- Root descendant count: " + rootProxy.descendantCount);
for(var childIdx in rootProxy.children){
  var childProxy = rootProxy.children[childIdx];
  console.log("--- Child descendant count of " + childProxy.item.name + ": " + childProxy.descendantCount);  
}

console.log("::: Reading db.json");
var lbStore = kdbFS.loadJSONDoc("db.json");
module.exports.lbStore = lbStore;

var kdbModel = require('./kdb-model.js');
kdbFS.storeJSONDoc(kdbDirPath + "/modelDef.json", kdbModel.modelDef);

console.log("::: End KDB File Load");
