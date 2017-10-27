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

var modelConfig = kdbFS.loadJSONDoc("server/model-config.json");
var mountList = {};
var kdbDirPath = "kdb";
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
var mountFilePath = path.join(koheseKDBDirPath, 'mounts.json');

function initialize() {
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

  checkAndCreateDir(kdbDirPath);
  checkAndCreateDir(path.join(kdbDirPath, 'kohese-kdb'));
  //TODO: checkAndCreateDir does not handle cases such as test1/test2 if test1 does not exist.

  ItemProxy.getRootProxy().repoPath = path.join(koheseKDBDirPath, 'Root.json');

  // Check to see if a Root.json exists. If not, assume brand new kdb
  var create = false;
  try {
      kdbFS.loadJSONDoc(path.join(koheseKDBDirPath, 'Root.json'));
  } catch(err) {
      // Check to see if a flag was provided to create a new KDB
      for (var i = 2; i < process.argv.length; i++) {
          if(process.argv[i] === 'create') {
              create = true;
              break;
          }
      }
      
      if(!create && koheseKDBDirPath !== 'kdb/kohese-kdb') {
          console.log('No KDB found at ' + koheseKDBDirPath);
          console.log('To create a new KDB, run with the extra argument "create"');
          console.log('For example, "-kdb=PATH create"');
          process.exit();
      }
  }

  // Make a new KDB if the create flag is provided or it's running with the default KDB
  if (create) {
    console.log('::: Creating a new KDB at ' + koheseKDBDirPath);
    var uuid = require('node-uuid');
    var newRoot = {id: uuid.v1(), name: 'Root of ' + koheseKDBDirPath, description: 'Root of a repository.'};
    return createRepoStructure(koheseKDBDirPath).then(function(repo) {
      kdbFS.storeJSONDoc(path.join(koheseKDBDirPath, 'Root.json'), newRoot);
      return openRepositories();
    });
  } else {
    return openRepositories();
  }
}
module.exports.initialize = initialize;

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
  } else if (modelName === "Analysis") {
    // Check to see if Analysis is on the disk
    var sourceInstance = ItemProxy.getProxyFor(modelInstanceId);
    
    if (sourceInstance) {
      var repo = sourceInstance.getRepositoryProxy();
      var analysisPath = determineRepoStoragePath(repo) + "/Analysis/" + modelInstanceId + ".json";
      var itemRow;
      
      try {
        itemRow = kdbFS.loadJSONDoc(analysisPath);
      } catch (error){
        // Do nothing
        console.log("!!! Analysis for " + modelInstanceId + " not found.");
      }
      
      if(itemRow){
        modelStore[itemRow.id] = JSON.stringify(itemRow);
        instance = itemRow;
      }
    }
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
    mountList[repoMountData.id] = {'repoStoragePath': repoStoragePath, name: repoMountData.name};
    updateMountFile();
  
    repoStoragePath = determineRepoStoragePath(proxy);
    console.log("::: rSP: " + repoStoragePath);
    
    filePath = repoStoragePath + "/Root.json";
    var repoRootData = JSON.parse(JSON.stringify(modelInstance));
    delete repoRootData.parentId;
    delete repoRootData.repoStoragePath;
    delete repoRootData.mounted;
    
    return createRepoStructure(repoStoragePath).then(function (repo) {
      kdbFS.storeJSONDoc(filePath, repoRootData);
      
      if (isNewItem){
          // Need to call create repo structure once that has been removed form validate
          mountRepository({id: modelInstance.id, parentId: modelInstance.parentId, 'repoStoragePath': repoStoragePath});
      }
      
      return postStore(modelName, modelInstance);
    });
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
      
      return postStore(modelName, modelInstance);
    }
}

module.exports.storeModelInstance = storeModelInstance;

function postStore(modelName, modelInstance) {
  return new Promise(function(resolve, reject) {
    var status = kdbRepo.getItemStatus(ItemProxy.getProxyFor(modelInstance.id));
    
    var modelStore = kdbStore.models[modelName];
    modelStore[modelInstance.id] = JSON.stringify(modelInstance);
    
    resolve(status);
  });
}

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
      if(mountList[proxy.item.id].mounted) {
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
          // Repo is not mounted, so we're deleting an error repo.
          // In that case, remove it from the mount and remove the proxy.
          
          delete mountList[proxy.item.id];
          proxy.deleteItem();
          updateMountFile();
      }
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
function mountRepository(mountData) {
    
    // Format: mountData = {id: , name: , parentId: , repoStoragePath: } 
    // Attempt to mount the repository. If unable then make it apparent in the client.
    var modelStore = kdbStore.models['Repository'];
    var repoCanBeMounted = true;
    var repoRoot = {};
    
    if(mountData.repoStoragePath) {
        console.log("::: Mounting repository: " + mountData.name);
        try {
            repoRoot = kdbFS.loadJSONDoc(path.join(mountData.repoStoragePath, 'Root.json'));
        } catch(err) {
            repoCanBeMounted = false;
        }
    } else {
        console.log('!!! No mount path provided for mounting ' + mountData.id);
        repoCanBeMounted = false;
    }
    
    if(repoCanBeMounted) {
        var proxy;
        repoRoot.parentId = mountData.parentId;
        
        // Check to see if the repo has already been mounted. If so, then update it.
        if(mountList[mountData.id].mounted) {
            proxy = ItemProxy.getProxyFor(mountData.id);
            proxy.updateItem('Repository', repoRoot);
            modelStore[mountData.id] = JSON.stringify(repoRoot);
        } else {
            mountList[mountData.id].mounted = true;
            repoRoot.mounted = true;
            proxy = new ItemProxy('Repository', repoRoot);
            proxy.repoPath = path.join(mountData.repoStoragePath, 'Root.json');
            modelStore[mountData.id] = JSON.stringify(repoRoot);
            console.log('::: Validating mounted repository: ' + repoRoot.name);
            validateRepositoryStructure(mountData.repoStoragePath);
        }
    } else {
        // Repo cannot be mounted since Root.json is missing
        console.log('!!! Unable to mount repo ' + mountData.id);
        
        var errorRepo = {id: mountData.id,
                         name: 'Error: Unable to mount Repository ' + mountData.name,
                         parentId: mountData.parentId,
                         description: 'Error: Unable to load ' + mountData.repoStoragePath,
                         mounted: false
        };
        console.log("::: Looking at mountList");
        console.log(mountList);
        console.log("::: Looking at mountData");
        console.log(mountData);
        if (!mountList[mountData.id]) {
            mountList[mountData.id] = {};
        }
        mountList[mountData.id].mounted = false;

        var proxy = new ItemProxy('Repository', errorRepo);
        modelStore[errorRepo.id] = JSON.stringify(errorRepo);
    }
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function createRepoStructure(repoDirPath) {
    // Creates the directory structure for a repository for the given path.
    
    checkAndCreateDir(repoDirPath);
    
    // Check for the model directories
    for(var modelName in modelConfig){
      var modelDirPath = repoDirPath + "/" + modelName;
      var ignoreJSONFiles = (modelName === "Analysis");
      checkAndCreateDir(modelDirPath, ignoreJSONFiles);
    }
    
    return kdbRepo.initializeRepository(ItemProxy.getRootProxy(), repoDirPath);
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function validateRepositoryStructure (repoDirPath) {

  var modelDirList = kdbFS.getRepositoryFileList(repoDirPath);
  
  // Remove model directories that are no longer needed
  for (var dirIdx = 0; dirIdx < modelDirList.length; dirIdx++) {
    var modelDirName = modelDirList[dirIdx];
    if (!modelConfig[modelDirName]) {
      console.log("::: Removing stored directory for " + modelDirName);
      kdbFS.deleteFolderRecursive(repoDirPath + "/" + modelDirName);
    }
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
            var subRepoDirPath;

            // Check mountFile for the mount path or use a .mount file if necessary
            if(mountList[repoMount.id]) {
                console.log("==> in mount list");
                subRepoDirPath = mountList[repoMount.id].repoStoragePath;
                if(!mountList[repoMount.id].name) {
                    mountList[repoMount.id].name = repoMount.name;
                    updateMountFile();
                }
            }
            
            console.log("==> sRDP: " + subRepoDirPath);

            var mountData = {id: repoMount.id,
                             name: repoMount.name,
                             parentId: repoMount.parentId,
                             repoStoragePath: subRepoDirPath};
            mountRepository(mountData);
        }
    } else if (modelName === "Analysis") {
      
      // Skip the Analysis results
      
    } else {
        fileList = kdbFS.getRepositoryFileList(modelDirPath, jsonExt);
        for(var fileIdx = 0; fileIdx < fileList.length; fileIdx++) {
          var itemPath = modelDirPath + "/" + fileList[fileIdx];
          var itemRow = kdbFS.loadJSONDoc(itemPath);
          
          var proxy = new ItemProxy(modelName, itemRow);
          proxy.repoPath = itemPath;
          
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

function openRepositories() {
	// Check and process mounts.json
	// TODO Check for file existence prior to loading
	try {
	    mountList = kdbFS.loadJSONDoc(mountFilePath);
	} catch(err) {
	    // Do nothing; the mount list will get written when validating if necessary
	}

	// Create/validate root repo structure
	console.log(">>> Validating Root Repository Structure");
	validateRepositoryStructure(koheseKDBDirPath);

	// Validate the repositories listed inside the mount file
	console.log(">>> Mounting and Validating External Repos");
	for(var id in mountList) {
	    if(!mountList[id].mounted && mountList[id].repoStoragePath) {
	        mountRepository({'id': id, name: mountList[id].name, parentId: '', repoStoragePath: mountList[id].repoStoragePath});
	    }
	}
	console.log(">>> Done loading repositories");

	//Load corresponding git repositories
	var promises = [];
	promises.push(kdbRepo.openRepo(ItemProxy.getRootProxy()));
	index(ItemProxy.getRootProxy(), false);

	// Initialize nodegit repo-open promises
	for(var id in mountList) {
	    if(mountList[id].mounted && mountList[id].repoStoragePath) {
	        promises.push(kdbRepo.openRepo(ItemProxy.getProxyFor(id)));
	        // TODO Once Repositories are version controlled separately,
	        // index them here.
	    }
	}
	
	var rootProxy = ItemProxy.getRootProxy();
	rootProxy.repoPath = path.join(koheseKDBDirPath, 'Root.json');
	console.log("--- Root descendant count: " + rootProxy.descendantCount);
	for(var childIdx in rootProxy.children){
	  var childProxy = rootProxy.children[childIdx];
	  console.log("--- Child descendant count of " + childProxy.item.name + ": " + childProxy.descendantCount);  
	}

	var kdbModel = require('./kdb-model.js');
	kdbFS.storeJSONDoc(kdbDirPath + "/modelDef.json", kdbModel.modelDef);

	console.log("::: End KDB File Load");
	
	return Promise.all(promises);
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function index(proxy, overwrite) {
  return kdbRepo.generateCommitHistoryIndices(proxy, overwrite).then(function () {
    console.log("::: Indexing of " + proxy.item.name + " complete.");
  });
}
module.exports.index = index;