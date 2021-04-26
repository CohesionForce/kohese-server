/**
 *
 */

let path = require('path');

console.log('::: Begin KDB File Load');

var kdbFS = require('./kdb-fs');
var fs = require('fs');

var kdbModel = require('./kdb-model');

var jsonExt = /\.json$/;

import { ItemProxy } from '../common/src/item-proxy';
import { TreeConfiguration } from '../common/src/tree-configuration';
import { KoheseModel } from '../common/src/KoheseModel';
import { KoheseView } from '../common/src/KoheseView';
import { KDBCache } from './kdb-cache';
import { KDBRepo } from './kdb-repo';

module.exports.ItemProxy = ItemProxy;

var mountList = {};
var kdbDirPath = 'kdb';

let availableRepositories: any = [];

var koheseKDBDirPath;
var mountFilePath;

let commonModelFiles = 'common/models/';
let commonViewFiles = 'common/views/';

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function loadKoheseModelsAndViews() {
  console.log('::: Load Kohese Models');

  kdbFS.createDirIfMissing(koheseKDBDirPath + path.sep + 'Namespace');
  loadModelInstances('Namespace', 'common' + path.sep + 'Namespace', false);
  loadModelInstances('Namespace', koheseKDBDirPath + path.sep + 'Namespace',
    true);

  let repoModelFileDir = koheseKDBDirPath + '/KoheseModel';
  kdbFS.createDirIfMissing(repoModelFileDir);
  loadModelInstances('KoheseModel', commonModelFiles, false);
  loadModelInstances('KoheseModel', repoModelFileDir, true);

  let repoViewFileDir = koheseKDBDirPath + '/KoheseView';
  kdbFS.createDirIfMissing(repoViewFileDir);
  loadModelInstances('KoheseView', commonViewFiles, false);
  loadModelInstances('KoheseView', repoViewFileDir, true);

  let repoUserFileDir = koheseKDBDirPath + '/KoheseUser';
  kdbFS.createDirIfMissing(repoUserFileDir);
  loadModelInstances('KoheseUser', repoUserFileDir, true);

  KoheseModel.modelDefinitionLoadingComplete();

}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
async function initialize (koheseKdbPath, indexAndExit) {
  koheseKDBDirPath = path.join(kdbDirPath, koheseKdbPath);
  mountFilePath = path.join(koheseKDBDirPath, 'mounts.json');

  checkAndCreateDir(kdbDirPath);

  // TODO: Need to remove storage of modelDef.json
  kdbFS.storeJSONDoc(kdbDirPath + '/modelDef.json', kdbModel.modelDefinitions);

  // TODO: checkAndCreateDir does not handle cases such as test1/test2 if test1 does not exist.
  checkAndCreateDir(koheseKDBDirPath);

  // Get all repositories and add to AvailableRepositories.json file
  var repositoryList = fs.readdirSync('./kdb').filter(function (file) {
    return fs.statSync(path.join('./kdb', file)).isDirectory();
  });
  setAvailableRepositories(koheseKDBDirPath, availableRepositories)
  for (let n: number = 0; n < repositoryList.length; n++) {
    var tmppath = path.join(kdbDirPath, repositoryList[n]);
    if (fs.existsSync(tmppath + '/Root.json') && (!fs.existsSync(path.join(tmppath, 'KoheseUser')))) {
      setAvailableRepositories(tmppath, availableRepositories);
    }
  }
  let configurationPath: string = path.resolve(kdbDirPath, 'AvailableRepositories.json');
  kdbFS.storeJSONDoc(configurationPath, availableRepositories);



  TreeConfiguration.getWorkingTree().getRootProxy().repoPath = path.join(koheseKDBDirPath, 'Root.json');

  // Check to see if a Root.json exists. If not, assume brand new kdb
  var create = false;
  try {
      kdbFS.loadJSONDoc(path.join(koheseKDBDirPath, 'Root.json'));
  } catch(err) {
      // Check to see if a flag was provided to create a new KDB
      for (var i = 2; i < process.argv.length; i++) {
        if (process.argv[i] === 'create') {
          create = true;
          break;
        }
      }

      if (!create) {
        if (koheseKDBDirPath === 'kdb/kohese-kdb') {
          create = true;
        } else {
          console.log('No KDB found at ' + koheseKDBDirPath);
          console.log('To create a new KDB, run with the extra argument "create"');
          console.log('For example, "-kdb=PATH create"');
          process.exit();
        }
      }
  }

  // Make a new KDB if the create flag is provided or it's running with the default KDB
  if (create) {
    console.log('::: Creating a new KDB at ' + koheseKDBDirPath);
    var uuid = require('node-uuid');
    var newRoot = {id: uuid.v1(), name: 'Root of ' + koheseKDBDirPath, description: 'Root of a repository.'};
    // eslint-disable-next-line no-unused-vars
    return createRepoStructure(koheseKDBDirPath).then(async function(repo) {
      kdbFS.storeJSONDoc(path.join(koheseKDBDirPath, 'Root.json'), newRoot);
      await KDBRepo.add('ROOT','Root.json');
      await KDBRepo.add('ROOT','.gitignore');
      await KDBRepo.commit(['ROOT'], 'default-username', 'default-email', 'Creation of new repo');

      loadKoheseModelsAndViews();

      return openRepositories(indexAndExit);
    });
  } else {

    loadKoheseModelsAndViews();

    return openRepositories(indexAndExit);
  }
}
module.exports.initialize = initialize;


//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function getAvailableRepositories(): any {
  return availableRepositories;
}
module.exports.getAvailableRepositories = getAvailableRepositories;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function getDisabledRepositories(): any {
  let disabledRepositories: any = [];
  for (var id in mountList) {
    if (mountList[id].disabled) {
      disabledRepositories.push({id: id, kind: 'Repository', parentId: mountList[id].parentId, name: mountList[id].name})
    }
  }
  return disabledRepositories;
}
module.exports.getDisabledRepositories = getDisabledRepositories;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function unMountRepository(id) {
  kdbFS.removeFile(mountList[id].repoStoragePath + '.json.mount');
  delete mountList[id];
  updateMountFile();
  let proxy = ItemProxy.getWorkingTree().getProxyFor(id);
  proxy.deleteItem();
  KDBRepo.closeRepo(id);
}
module.exports.unMountRepository = unMountRepository;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function disableRepository(id) {
  mountList[id].disabled = true;
  mountList[id].mounted = false;
  updateMountFile();
  let proxy = ItemProxy.getWorkingTree().getProxyFor(id);
  proxy.deleteItem();
  KDBRepo.closeRepo(id);
}
module.exports.disableRepository = disableRepository;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function enableRepository(id: string) {
  delete mountList[id].disabled
  updateMountFile();
}
module.exports.enableRepository = enableRepository;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function addRepository(id: string, parentId: string) {
  for (var x: number = 0; x<availableRepositories.length; x++) {
    if (availableRepositories[x].id === id) {
      var repoMount = availableRepositories[x];
      break;
    }
  }
  if (!mountList[id]) {
    mountList[repoMount.id] = {
      name: repoMount.name,
      repoStoragePath: repoMount.repoStoragePath,
      parentId: parentId
    }

    updateMountFile();

    let path = repoMount.repoStoragePath.substring(0, repoMount.repoStoragePath.lastIndexOf('/'));
    var repoMountFilePath = path + '/' + repoMount.id + '.json.mount';

    var repoMountData = {
      id: repoMount.id,
      name: repoMount.name,
      parentId: parentId
    };

    console.log('::: Repo Mount Information');
    console.log(repoMountData)
    kdbFS.storeJSONDoc(repoMountFilePath, repoMountData);
  } else {
    delete mountList[id].disabled;
    mountList[id].parentId = parentId;
    updateMountFile();
    let path = repoMount.repoStoragePath.substring(0, repoMount.repoStoragePath.lastIndexOf('/'));
    var repoMountFilePath = path + '/' + repoMount.id + '.json.mount';

    var repoMountData = {
      id: repoMount.id,
      name: repoMount.name,
      parentId: parentId
    };

    console.log('::: Repo Mount Information');
    console.log(repoMountData)
    kdbFS.storeJSONDoc(repoMountFilePath, repoMountData);
  }
}
module.exports.addRepository = addRepository;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function setAvailableRepositories(dir, availableRepositories) {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      setAvailableRepositories(fullPath, availableRepositories);
    } else {
      if (file === 'Root.json') {
        var repositories = kdbFS.loadJSONDoc(fullPath);
        fullPath = path.parse(fullPath).dir
        availableRepositories.push({
          id: repositories.id, name: repositories.name, description: repositories.description, repoStoragePath: fullPath
        });
      }
    }
  });
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function determineRepoStoragePath(repo){
  var repoStoragePath;
  if(repo && repo.item.id !== 'ROOT'){
    console.log('::: Repository => ' + repo.item.name);
    if(repo.repoPath){
      repoStoragePath = repo.repoPath.replace('/Root.json', '');
      repoStoragePath = repoStoragePath.replace(jsonExt, '');
    } else {
      // Must be a new repo
      var parentRepo = repo.parentProxy.getRepositoryProxy();
      var parentRepoStoragePath = determineRepoStoragePath(parentRepo);
      var repoDirPath = parentRepoStoragePath + '/Repository/' + repo.item.id;
      repo.repoPath = repoDirPath + '.json';
      console.log('::: >>> Creating new repo path: ' + repoDirPath);

      repoStoragePath = repoDirPath;
    }
  } else {
    console.log('::: Repository => KDB Data Store');
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
function storeModelInstance(proxy, isNewItem, enable: boolean = false){

  var modelName = proxy.kind;
  var modelInstance = proxy.item;

  if(modelName !== 'Analysis'){
    // Delete any associated analysis
    removeModelAnalysis(proxy);
  }

  var repo = proxy.getRepositoryProxy();
  var repoStoragePath = determineRepoStoragePath(repo);

  console.log('>>> Repo storage: ' + repoStoragePath);
  var filePath = repoStoragePath + '/' + modelName + '/' + modelInstance.id + '.json';

  var promise : Promise<boolean|void> = Promise.resolve(true);
  if (modelName === 'Repository'){
    var repoMountFilePath;
    if (isNewItem) {
      var parentRepo = proxy.parentProxy.getRepositoryProxy();
      var parentRepoStoragePath = determineRepoStoragePath(parentRepo);
      repoMountFilePath = parentRepoStoragePath + '/Repository/' + modelInstance.id + '.json.mount';
    } else {
      let path = mountList[modelInstance.id].repoStoragePath.substring(0, mountList[modelInstance.id].repoStoragePath.lastIndexOf('/'));
      repoMountFilePath = path + '/' + modelInstance.id + '.json.mount';
      // If repo name has changed, need to change the Name in Available Repositories since this is created at startup
      // Use repo path so don't change name of a duplicate repo
      let index = availableRepositories.findIndex(y => y.repoStoragePath === mountList[modelInstance.id].repoStoragePath)
      availableRepositories[index].name = modelInstance.name
    }

    var repoMountData = {
      id: modelInstance.id,
      name: modelInstance.name,
      parentId: modelInstance.parentId
    };

    console.log('::: Repo Mount Information -- StoreModelInstance');
    console.log(repoMountData);
    if (enable === false) {
      kdbFS.createDirIfMissing(path.dirname(repoMountFilePath));
      kdbFS.storeJSONDoc(repoMountFilePath, repoMountData);
    }

    mountList[repoMountData.id] = {
      repoStoragePath : repoStoragePath,
      name: repoMountData.name,
      parentId: repoMountData.parentId
    };

    // mountList[repoMountData.id].mounted = true;
    updateMountFile();

    repoStoragePath = determineRepoStoragePath(proxy);
    console.log('::: rSP: ' + repoStoragePath);

    filePath = repoStoragePath + '/Root.json';
    proxy.repoPath = filePath
    var repoRootData = JSON.parse(JSON.stringify(modelInstance));
    delete repoRootData.parentId;
    delete repoRootData.repoStoragePath;
    delete repoRootData.mounted;
    modelInstance = repoRootData;

    if (isNewItem && !enable) {
      // eslint-disable-next-line no-unused-
      availableRepositories.push({id: repoMountData.id,
        name: repoMountData.name,
        description: modelInstance.description,
        repoStoragePath: repoStoragePath})
      promise = createRepoStructure(repoStoragePath).then(function (repo) {
        // TODO: Need to call create repo structure once that has been removed from validate
      });
    }
  } else {
    if(modelName !== 'Analysis' && filePath !== proxy.repoPath){
      console.log('}}} Old: ' + proxy.repoPath);
      if (proxy.repoPath){
        kdbFS.removeFile(proxy.repoPath);
      }
      console.log('}}} New: ' + filePath);
      proxy.repoPath = filePath;
    }
  }

  return promise.then(async function () {
    // TODO:  This needs to be replaced with a uniform directory approach that does not include Model Kinds
      kdbFS.createDirIfMissing(path.dirname(filePath));
      if (enable === false) {
          kdbFS.storeJSONDoc(filePath, proxy.cloneItemAndStripDerived());
      }
      if (isNewItem && (modelName === 'Repository') && !enable) {
        if (kdbFS.pathExists(path.join(repoStoragePath, '.git'))) {
          await KDBRepo.openRepo(repoMountData.id, repoStoragePath)
        } else {
          console.log('*** No GIT Folder Exists - Invalid Repository for ' + repoMountData.id + ' repo ' + repoStoragePath)
        }
      }
      var repoId = KDBRepo.getRepoId(repoStoragePath);
      if (repoId === undefined) {
        repoId = ItemProxy.getWorkingTree().getRootProxy().item.id;
        // TODO: Investigate If This Is Still Needed After Split or if it needs to change
        // Close and reopen Root repo to Fix Error when creating Item after Repo creation
        if (kdbFS.pathExists(filePath)) {
            KDBRepo.closeRepo(repoId);
            await KDBRepo.openRepo(repoId, koheseKDBDirPath)
        }
      }

      var finalRepositoryPath;
      var repositoryPath;
      var filePath2 = KDBRepo.getFilePath(repoStoragePath)
      if (filePath2 === undefined) {
        repositoryPath = ItemProxy.getWorkingTree().getRootProxy().repoPath.split('Root.json')[0];
        repositoryPath = ItemProxy.getWorkingTree().getProxyFor(modelInstance.id).repoPath.split(repositoryPath)[1];
        finalRepositoryPath = repositoryPath;
      } else {
        repositoryPath = ItemProxy.getWorkingTree().getProxyFor(modelInstance.id).repoPath.split(filePath2)[1];
        finalRepositoryPath = repositoryPath.substring(1);
      }
      return KDBRepo.getItemStatus(repoId, finalRepositoryPath);
  }).then((status) => {
    return status;
  });
}

module.exports.storeModelInstance = storeModelInstance;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function storeModelAnalysis(analysisInstance){
  var modelInstanceId = analysisInstance.id;

  var proxy = ItemProxy.getWorkingTree().getProxyFor(modelInstanceId);

  if (proxy) {
    console.log('::: Storing analysis for ' + proxy.item.id + ' - ' + proxy.item.name);

    let repo = proxy.getRepositoryProxy();
    let analysisDir = determineRepoStoragePath(repo) + '/Analysis';
    checkAndCreateDir(analysisDir, true);

    let analysisFilePath =  analysisDir + '/' + modelInstanceId + '.json';
    kdbFS.storeJSONDoc(analysisFilePath, analysisInstance);

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

  if(modelName === 'Analysis'){
    var repo = proxy.getRepositoryProxy();
    var repoStoragePath = determineRepoStoragePath(repo);
    var filePath = repoStoragePath + '/' + modelName + '/' + instanceId + '.json';

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
function checkAndCreateDir(dirName, ignoreJSONFiles : boolean = false) {
  kdbFS.createDirIfMissing(dirName);
  if(ignoreJSONFiles){
    kdbFS.createGITIgnoreJSONIfMissing(dirName + '/.gitignore');
  } else {
    kdbFS.createEmptyFileIfMissing(dirName + '/.gitignore');
  }
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function mountRepository(mountData, enable: boolean = false) {

    // Format: mountData = {id: , name: , parentId: , repoStoragePath: }
    // Attempt to mount the repository. If unable then make it apparent in the client.
    var repoCanBeMounted = true;
    var repoRoot = {
      parentId : undefined,
      mounted: undefined,
      name: undefined
    };

    if(mountData.repoStoragePath) {
        console.log('::: Mounting repository: ' + mountData.name);
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
        let proxy;
        repoRoot.parentId = mountData.parentId;
        repoRoot.name = mountData.name;

        // Check to see if the repo has already been mounted. If so, then update it.
        if(mountList[mountData.id].mounted) {
            proxy = ItemProxy.getWorkingTree().getProxyFor(mountData.id);
            proxy.updateItem('Repository', repoRoot);
        } else {
            mountList[mountData.id].mounted = true;
            repoRoot.mounted = true;
            proxy = new ItemProxy('Repository', repoRoot);
            proxy.repoPath = path.join(mountData.repoStoragePath, 'Root.json');
            console.log('::: Validating mounted repository: ' + repoRoot.name);
            if (enable === true) {
              proxy.mountRepository(proxy.item.id, 'Repository')
            }
            validateRepositoryStructure(mountData.repoStoragePath, enable);
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
        console.log('::: Looking at mountList');
        console.log(mountList);
        console.log('::: Looking at mountData');
        console.log(mountData);
        if (!mountList[mountData.id]) {
            mountList[mountData.id] = {};
        }
        mountList[mountData.id].mounted = false;

        // eslint-disable-next-line no-unused-vars
        let proxy = new ItemProxy('Repository', errorRepo);
    }
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function createRepoStructure(repoDirPath) {
    // Creates the directory structure for a repository for the given path.

    checkAndCreateDir(repoDirPath);

    return KDBRepo.initializeRepository(ItemProxy.getWorkingTree().getRootProxy().item.id, repoDirPath);
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function loadModelInstances (kind, modelDirPath, inRepo, enable: boolean = false) {
  let fileList = kdbFS.getRepositoryFileList(modelDirPath, jsonExt);
  for(var fileIdx = 0; fileIdx < fileList.length; fileIdx++) {
    var itemPath = modelDirPath + '/' + fileList[fileIdx];
    var itemPayload = kdbFS.loadJSONDoc(itemPath);

    let proxy;
    switch (kind){
      case 'KoheseModel':
        proxy = new KoheseModel(itemPayload);
        break;
      case 'KoheseView':
        proxy = new KoheseView(itemPayload, TreeConfiguration.
          getWorkingTree());
        break;
      default:
        proxy = new ItemProxy(kind, itemPayload);
        if (enable === true) {
          proxy.mountRepository(proxy.item.id, kind)
        }
    }

    if(inRepo){
      proxy.repoPath = itemPath;
    }

    migrate(proxy, kind);
  }
}

function migrate(itemProxy: ItemProxy, typeName: string): void {
  let migrated: boolean = false;
  if ((typeName === 'KoheseModel') || (typeName === 'KoheseView')) {
    if (itemProxy.item.namespace == null) {
      itemProxy.item.namespace = {
        id: 'com.kohese.userdefined'
      };

      migrated = true;
    }
  }

  if (migrated) {
    storeModelInstance(itemProxy, false);
  }
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function validateRepositoryStructure (repoDirPath, enable: boolean = false) {

  var modelDirList = kdbFS.getRepositoryFileList(repoDirPath);

  let modelDefinitions = KoheseModel.getModelDefinitions();

  // Remove model directories that are no longer needed from the model list
  // Note: Iterate in reverse to allow array to be modified
  for (var dirIdx = modelDirList.length - 1; dirIdx >= 0; dirIdx--) {
    var modelDirName = modelDirList[dirIdx];
    if (!modelDefinitions[modelDirName]) {
      if (modelDirName !== '.cache') {
        console.log('*** Found unexpected repo directory: ' + repoDirPath + ' -> ' + modelDirName);
      }

      // Remove the unexpected model kind from the list
      modelDirList.splice(dirIdx, 1);
    }
  }

  for(var modelIdx = 0; modelIdx < modelDirList.length; modelIdx++){
    var modelName = modelDirList[modelIdx];
    var modelDirPath = repoDirPath + '/' + modelName;
    var fileList;

    switch(modelName) {
      case 'Repository':
        // TODO: Need to update to look at Configuration File????
        fileList = kdbFS.getRepositoryFileList(modelDirPath, /\.mount$/);
        for(var fileIdx = 0; fileIdx < fileList.length; fileIdx++) {
            var itemPath = modelDirPath + '/' + fileList[fileIdx];
            var repoMount = kdbFS.loadJSONDoc(itemPath);
            var subRepoDirPath;

            // Check mountFile for the mount path or use a .mount file if necessary
            if(mountList[repoMount.id] && !mountList[repoMount.id].disabled) {
                console.log('==> in mount list');
                subRepoDirPath = mountList[repoMount.id].repoStoragePath;
                if(!mountList[repoMount.id].name) {
                    mountList[repoMount.id].name = repoMount.name;
                    updateMountFile();
                }
            }

            if (!mountList[repoMount.id].disabled) {
              console.log("==> sRDP: " + subRepoDirPath);

              var mountData = {
                id: repoMount.id,
                name: repoMount.name,
                parentId: repoMount.parentId,
                repoStoragePath: subRepoDirPath,
              };
               mountRepository(mountData, enable);
            } else {
              console.log('::: not mounted - disabled ', mountList[repoMount.id].name)
            }
        }
        break;
      case 'Analysis':
      case 'KoheseModel':
      case 'KoheseView':
      case 'KoheseUser':

        // Skip this model kind
        console.log('::: Skipping ' + modelName);
        break;

      default:
        const inRepo = true;
        loadModelInstances(modelName, modelDirPath, inRepo, enable);
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

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
async function openRepositories(indexAndExit) {
	// Check and process mounts.json
	// TODO Check for file existence prior to loading
	try {
	    mountList = kdbFS.loadJSONDoc(mountFilePath);
	} catch(err) {
	    // Do nothing; the mount list will get written when validating if necessary
	}

  let rootProxy = ItemProxy.getWorkingTree().getRootProxy();
  // TODO: Need to ensure that KDB Cache initialization has knowledge of mounted roots
  let kdbCache = new KDBCache(koheseKDBDirPath);
  KDBCache.setItemCache(kdbCache);

  await kdbCache.updateCache();

  console.log('::: Finished cache update: ' + kdbCache.repoPath);

  if (indexAndExit){
      return Promise.resolve(true);
  }

  // Create/validate root repo structure
  console.log('>>> Validating Root Repository Structure');
  validateRepositoryStructure(koheseKDBDirPath);

  // Validate the repositories listed inside the mount file
  console.log('>>> Mounting and Validating External Repos');
  for(let id in mountList) {
    if(!mountList[id].mounted && mountList[id].repoStoragePath && !mountList[id].disabled) {
        mountRepository({'id': id, name: mountList[id].name, parentId: mountList[id].parentId,
                        repoStoragePath: mountList[id].repoStoragePath});
    }
  }
  console.log('>>> Done loading repositories');

  //Load corresponding git repositories
  var promises = [];
  promises.push(KDBRepo.openRepo(ItemProxy.getWorkingTree().getRootProxy().item.id, koheseKDBDirPath));

  // Initialize nodegit repo-open promises
  for(let id in mountList) {
    if(mountList[id].mounted && mountList[id].repoStoragePath) {
      if (kdbFS.pathExists(path.join(mountList[id].repoStoragePath, '.git'))) {
        promises.push(KDBRepo.openRepo(id, mountList[id].repoStoragePath));
      } else {
        console.log('*** No GIT Folder Exists - Invalid Repository for ' + id + ' repo ' + mountList[id].repoStoragePath)
      }
    }
  }

  rootProxy.repoPath = path.join(koheseKDBDirPath, 'Root.json');
  console.log('--- Root descendant count: ' + rootProxy.descendantCount);
  for(var childIdx in rootProxy.children){
    var childProxy = rootProxy.children[childIdx];
    console.log('--- Child descendant count of ' + childProxy.item.name + ': ' + childProxy.descendantCount);
  }

  return Promise.all(promises).then(async () => {
    // Need to wait for all repos to be loaded before continuing
    console.log('::: End KDB File Load');
    let workingTree = ItemProxy.getWorkingTree();
    workingTree.loadingComplete();
    await workingTree.saveToCache();
  });

}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
async function openRepository(id, indexAndExit){


  let workingTree = ItemProxy.getWorkingTree();
  workingTree.setLoading();
  let enable : boolean = true;


    // Open Git Repo
  if (kdbFS.pathExists(path.join(mountList[id].repoStoragePath, '.git'))) {
    await KDBRepo.openRepo(id, mountList[id].repoStoragePath);
  } else {
    console.log('*** No GIT Folder Exists - Invalid Repository for ' + id + ' repo ' + mountList[id].repoStoragePath)
  }

  // Mount Repository
  mountRepository({
    'id': id, name: mountList[id].name, parentId: mountList[id].parentId,
    repoStoragePath: mountList[id].repoStoragePath
  }, enable);

  console.log('::: End Enabled Repository Load');
  workingTree.unsetLoading();
  workingTree.saveToCache();

}
module.exports.openRepository = openRepository;

