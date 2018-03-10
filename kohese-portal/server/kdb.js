/**
 *
 */

var fs = require('fs');
var path = require('path');

console.log("::: Begin KDB File Load");

var kdbFS = require('./kdb-fs.js');
var kdbRepo = require('./kdb-repo.js');
module.exports.kdbRepo = kdbRepo;

var kdbModel = require('./kdb-model.js');

var jsonExt = /\.json$/;

var ItemProxy = require('../common/src/item-proxy.js');
var CreateStates = require('../common/src/createStates.js');
module.exports.ItemProxy = ItemProxy;

// TODO:  Need to remove dependence on modelConfig file
var modelConfig = kdbFS.loadJSONDoc("server/model-config.json");
var mountList = {};
var kdbDirPath = "kdb";

var koheseKDBDirPath;
var mountFilePath;

let commonModelFiles = 'common/models/';
let commonViewFiles = 'common/views/';

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function loadKoheseModelsAndViews() {
  console.log('::: Load Kohese Models');

  const saveRepoPath = false;

  let repoModelFileDir = koheseKDBDirPath + '/KoheseModel';
  kdbFS.createDirIfMissing(repoModelFileDir);
  loadModelInstances('KoheseModel', commonModelFiles, false);
  loadModelInstances('KoheseModel', repoModelFileDir, true);

  let repoViewFileDir = koheseKDBDirPath + '/KoheseView';
  kdbFS.createDirIfMissing(repoViewFileDir);
  loadModelInstances('KoheseView', commonViewFiles, false);
  loadModelInstances('KoheseView', repoViewFileDir, true);

  ItemProxy.modelDefinitionLoadingComplete();

}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function initialize(koheseKdbPath) {
  koheseKDBDirPath = path.join(kdbDirPath, koheseKdbPath);
  mountFilePath = path.join(koheseKDBDirPath, 'mounts.json');

  kdbFS.storeJSONDoc(kdbDirPath + "/modelDef.json", kdbModel.modelDef);

  // TODO:  Need to remove dependence on modelConfig file
  var modelKinds = Object.keys(modelConfig);
  modelKinds.sort();
  console.log("::: ModelKinds: " + modelKinds);

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

      loadKoheseModelsAndViews();
      // ItemProxy.loadModelDefinitions(kdbModel.modelDef);

      return openRepositories();
    });
  } else {

    loadKoheseModelsAndViews();
    // ItemProxy.loadModelDefinitions(kdbModel.modelDef);

    return openRepositories();
  }
}
module.exports.initialize = initialize;

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
function retrieveAnalysis(forProxy) {
  let modelInstanceId = forProxy.item.id;
  console.log('::: Retrieving analysis for ' + forProxy.kind + ' - ' + modelInstanceId);

  let analysis;

  if (forProxy.analysis) {
    analysis = forProxy.analysis;
  } else {
    // Load from the repository if it exists
    let repo = forProxy.getRepositoryProxy();
    let analysisPath = determineRepoStoragePath(repo) + '/Analysis/' + modelInstanceId + '.json';

    try {
      analysis = kdbFS.loadJSONDoc(analysisPath);
      forProxy.analysis = analysis;
    } catch (error){
      // Do nothing
      console.log('!!! Analysis for ' + modelInstanceId + ' not found.');
    }
  }

  return analysis;
}

module.exports.retrieveAnalysis = retrieveAnalysis;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function storeModelInstance(proxy, isNewItem){

  var modelName = proxy.kind;
  var modelInstance = proxy.item;

  if(modelName !== "Analysis"){
    // Delete any associated analysis
    removeModelAnalysis(proxy);
  }

  var repo = proxy.getRepositoryProxy();
  var repoStoragePath = determineRepoStoragePath(repo);

  console.log(">>> Repo storage: " + repoStoragePath);
  var filePath = repoStoragePath + "/" + modelName + "/" + modelInstance.id + ".json";

  var promise = Promise.resolve(true);
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
    modelInstance = repoRootData;

    if (isNewItem) {
      promise = createRepoStructure(repoStoragePath).then(function (repo) {
        // Need to call create repo structure once that has been removed from validate
      });
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
  }

  return promise.then(function () {
    // TODO:  This needs to be replaced with a uniform directory approach that does not include Model Kinds
    kdbFS.createDirIfMissing(path.dirname(filePath));

    kdbFS.storeJSONDoc(filePath, proxy.cloneItemAndStripDerived());

    if (isNewItem && (modelName === 'Repository')) {
      mountRepository({id: modelInstance.id, parentId: modelInstance.parentId, 'repoStoragePath': repoStoragePath});
    }

    var repositoryPath = ItemProxy.getRootProxy().repoPath.split('Root.json')[0];
    repositoryPath = ItemProxy.getProxyFor(modelInstance.id).repoPath.split(repositoryPath)[1];
    return kdbRepo.getItemStatus(ItemProxy.getRootProxy().item.id,
        repositoryPath);
  }).then((status) => {
    return status;
  });
}

module.exports.storeModelInstance = storeModelInstance;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function storeModelAnalysis(analysisInstance){
  var modelName = 'Analysis';
  var modelInstanceId = analysisInstance.id;

  var proxy = ItemProxy.getProxyFor(modelInstanceId);

  if (proxy) {
    console.log('::: Storing analysis for ' + proxy.item.id + ' - ' + proxy.item.name);

    var repo = proxy.getRepositoryProxy();
    var analysisPath = determineRepoStoragePath(repo) + '/Analysis/' + modelInstanceId + '.json';

    kdbFS.storeJSONDoc(analysisPath, analysisInstance);

  } else {
    console.log('*** No item found for analysis instance: ' + modelInstanceId);
  }
}
module.exports.storeModelAnalysis = storeModelAnalysis;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function removeModelInstance(proxy){
  var modelName = proxy.kind;
  var instanceId = proxy.item.id;

  if(modelName === "Analysis"){
    var repo = proxy.getRepositoryProxy();
    var repoStoragePath = determineRepoStoragePath(repo);
    var filePath = repoStoragePath + "/" + modelName + "/" + instanceId + ".json";

    kdbFS.removeFile(filePath);
  } else if (modelName === 'Repository') {
      if(mountList[proxy.item.id].mounted) {
          // Delete any associated analysis
          removeModelAnalysis(proxy);

          var parentRepo = proxy.parentProxy.getRepositoryProxy();
          var parentRepoPath = mountList[parentRepo.item.id].repoStoragePath;

          kdbFS.removeFile(path.join(parentRepoPath, 'Repository', proxy.item.id + '.json.mount'));
          delete mountList[proxy.item.id];
          updateMountFile();

          // TODO: Should remove the proxies of all the children, but not delete from disk.

      } else {
          // Repo is not mounted, so we're deleting an error repo.
          // In that case, remove it from the mount and remove the proxy.

          delete mountList[proxy.item.id];
          updateMountFile();
      }
  } else {
    // Delete any associated analysis
    removeModelAnalysis(proxy);

    if (proxy.repoPath){
      kdbFS.removeFile(proxy.repoPath);
      delete proxy.repoPath;
    }
  }

}

module.exports.removeModelInstance = removeModelInstance;


//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function removeModelAnalysis(proxy) {
  var modelInstanceId = proxy.item.id;

  var repo = proxy.getRepositoryProxy();
  var analysisPath = determineRepoStoragePath(repo) + '/Analysis/' + modelInstanceId + '.json';

  const ignoreNonExistent = true;
  kdbFS.removeFile(analysisPath, ignoreNonExistent);

}
module.exports.removeModelAnalysis = removeModelAnalysis;

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
        } else {
            mountList[mountData.id].mounted = true;
            repoRoot.mounted = true;
            proxy = new ItemProxy('Repository', repoRoot);
            proxy.repoPath = path.join(mountData.repoStoragePath, 'Root.json');
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

    return kdbRepo.initializeRepository(ItemProxy.getRootProxy().item.id, repoDirPath);
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function loadModelInstances (kind, modelDirPath, inRepo) {
  let fileList = kdbFS.getRepositoryFileList(modelDirPath, jsonExt);
  for(var fileIdx = 0; fileIdx < fileList.length; fileIdx++) {
    var itemPath = modelDirPath + "/" + fileList[fileIdx];
    var itemRow = kdbFS.loadJSONDoc(itemPath);

    var proxy = new ItemProxy(kind, itemRow);

    if(inRepo){
      proxy.repoPath = itemPath;
    }
  }
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function validateRepositoryStructure (repoDirPath) {

  var modelDirList = kdbFS.getRepositoryFileList(repoDirPath);

  // Remove model directories that are no longer needed from the model list
  // Note: Iterate in reverse to allow array to be modified
  for (var dirIdx = modelDirList.length - 1; dirIdx >= 0; dirIdx--) {
    var modelDirName = modelDirList[dirIdx];
    if (!modelConfig[modelDirName]) {
      console.log("*** Found unexpected repo directory: " + repoDirPath + " -> " + modelDirName);
      // Remove the unexpected model kind from the list
      modelDirList.splice(dirIdx, 1);
    }
  }

  for(var modelIdx = 0; modelIdx < modelDirList.length; modelIdx++){
    var modelName = modelDirList[modelIdx];
    var modelDirPath = repoDirPath + "/" + modelName;
    var fileList;

    switch(modelName) {
      case 'Repository':
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
        break;
      case 'Analysis':
      case 'KoheseModel':
      case 'KoheseView':

        // Skip this model kind
        console.log('::: Skipping ' + modelName);
        break;

      default:
        const inRepo = true;
        loadModelInstances(modelName, modelDirPath, inRepo);
    }
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
	promises.push(kdbRepo.openRepo(ItemProxy.getRootProxy().item.id, koheseKDBDirPath));
	index(ItemProxy.getRootProxy(), false);

	// Initialize nodegit repo-open promises
	for(var id in mountList) {
	    if(mountList[id].mounted && mountList[id].repoStoragePath) {
	      var proxy = ItemProxy.getProxyFor(id);
	        //promises.push(kdbRepo.openRepo(ItemProxy.getRootProxy().item.id, proxy.repoPath));
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

	console.log("::: End KDB File Load");
	console.log(new Date());
  ItemProxy.loadingComplete();
  console.log(new Date());

	return Promise.all(promises);
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function index(proxy, overwrite) {
  var repositoryPath = proxy.repoPath;
  return kdbRepo.generateCommitHistoryIndices((repositoryPath.endsWith('Root.json') ?
      path.dirname(repositoryPath) : repositoryPath), overwrite).then(function () {
    console.log("::: Indexing of " + proxy.item.name + " complete.");
  });
}
module.exports.index = index;
