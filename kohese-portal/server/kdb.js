/**
 * 
 */

console.log("::: Begin KDB File Load");

var kdbFS = require('./kdb-fs.js');
var jsonExt = /\.json$/;

var ItemProxy = require('../common/models/item-proxy.js');
module.exports.ItemProxy = ItemProxy;

var kdbStore = {};

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
  
  if(modelName !== "Analysis"){
    var strippedInstance = JSON.parse(JSON.stringify(modelInstance));
    if (proxy){
      proxy.updateItem(modelName, strippedInstance);
    } else {
      proxy = new ItemProxy(modelName, strippedInstance);
    }
    
    // Delete any associated analysis
    var analysisStore = kdbStore.models["Analysis"];
    if(analysisStore[modelInstance.id]){
      removeModelInstance("Analysis", modelInstance.id);
    }
  }

  repo = proxy.getRepositoryProxy();
  if(repo){
    console.log("::: Repository => " + repo.item.name);      
  } else {
    console.log("::: Repository => KDB Data Store");          
  }
    
  var filePath = exportDirPath + "/" + modelName + "/" + modelInstance.id + ".json";
  kdbFS.storeJSONDoc(filePath, modelInstance);
  
  var modelStore = kdbStore.models[modelName];
  modelStore[modelInstance.id] = JSON.stringify(modelInstance);
}

module.exports.storeModelInstance = storeModelInstance;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function removeModelInstance(modelName, instanceId){
  var filePath = exportDirPath + "/" + modelName + "/" + instanceId + ".json";

  kdbFS.removeFile(filePath);

  if(modelName !== "Analysis"){
    var proxy = ItemProxy.getProxyFor(instanceId);
    proxy.deleteItem();
    
    // Delete any associated analysis
    var analysisStore = kdbStore.models["Analysis"];
    if(analysisStore[instanceId]){
      removeModelInstance("Analysis", instanceId);
    }
  }
  
  var modelStore = kdbStore.models[modelName];
  delete modelStore[instanceId];
}

module.exports.removeModelInstance = removeModelInstance;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function checkAndCreateDir(dirName) {
  kdbFS.createDirIfMissing(dirName);
  kdbFS.createEmptyFileIfMissing(dirName + "/.gitignore");
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function validateRepositoryStructure (repoDirPath) {
  checkAndCreateDir(repoDirPath);

  var modelDirList = kdbFS.getRepositoryFileList(repoDirPath);
  
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
    checkAndCreateDir(modelDirPath);
  }
  
  kdbStore = {
    ids: {},
    models: {}
  };
  
  var modelDirList = kdbFS.getRepositoryFileList(repoDirPath);
  for(var modelIdx in modelDirList){
    var modelName = modelDirList[modelIdx];
    var modelDirPath = repoDirPath + "/" + modelName;
    var modelStore ={};
    kdbStore.models[modelName] = modelStore;
    var fileList = kdbFS.getRepositoryFileList(modelDirPath, jsonExt);
    for(var fileIdx in fileList) {
      var itemRow = kdbFS.loadJSONDoc(modelDirPath + "/" + fileList[fileIdx]);
      
      if(modelName !== "Analysis"){
        var proxy = new ItemProxy(modelName, itemRow);        
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

console.log("::: Validating Repository Structure")

var kdbDirPath = "kdb/kohese-kdb";
checkAndCreateDir(kdbDirPath);

var exportDirPath = kdbDirPath + "/export";
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
kdbFS.storeJSONDoc(kdbDirPath + "/lbStore.json", lbStore);

var kdbModel = require('./kdb-model.js');
kdbFS.storeJSONDoc(kdbDirPath + "/modelDef.json", kdbModel.modelDef);

console.log("::: End KDB File Load");
