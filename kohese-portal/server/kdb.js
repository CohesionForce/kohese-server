/**
 * 
 */

console.log("::: Begin KDB File Load");

var fs = require('fs');
var repoDirPath = "kohese-kdb";
var exportDirPath = repoDirPath + "/export";

var kdbStore = {};

//////////////////////////////////////////////////////////////////////////
// 
//////////////////////////////////////////////////////////////////////////
function loadJSONDoc(filePath) {
  
  console.log("::: Loading " + filePath);
  
  var fileData = fs.readFileSync(filePath, {encoding: 'utf8', flag: 'r'});
  var jsonObject = JSON.parse(fileData);

  return jsonObject;
}


//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function storeJSONDoc(filePath, doc) {
  
  console.log("::: Storing " + filePath);

  fs.writeFileSync(filePath, JSON.stringify(doc, null, '  '), {encoding: 'utf8', flag: 'w'});  
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
  var filePath = exportDirPath + "/" + modelName + "/" + modelInstance.id + ".json";
  storeJSONDoc(filePath, modelInstance);

  var modelStore = kdbStore.models[modelName];
  modelStore[modelInstance.id] = JSON.stringify(modelInstance);
}

module.exports.storeModelInstance = storeModelInstance;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function removeModelInstance(modelName, instanceId){
  var filePath = exportDirPath + "/" + modelName + "/" + instanceId + ".json";
  console.log("::: Removing " + filePath);
  fs.unlinkSync(filePath);
  var modelStore = kdbStore.models[modelName];
  delete modelStore[instanceId];
}

module.exports.removeModelInstance = removeModelInstance;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function checkAndCreateDir(dirName) {
  if (!fs.existsSync(dirName)) {
    console.log("::: Creating " + dirName);
    fs.mkdirSync(dirName);
    
    // Create and empty .gitignore file to ensure directory is present in git
    fs.writeFileSync(dirName + "/.gitignore","", {encoding: 'utf8', flag: 'w'});
  }
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function deleteFolderRecursive(dirPath) {
  var files = [];
  if( fs.existsSync(dirPath) ) {
      files = fs.readdirSync(dirPath);
      files.forEach(function(file,index){
          var curPath = dirPath + "/" + file;
          if(fs.lstatSync(curPath).isDirectory()) { // recurse
              deleteFolderRecursive(curPath);
          } else { // delete file
              fs.unlinkSync(curPath);
          }
      });
      fs.rmdirSync(dirPath);
  }
};

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function getRepositoryFileList(dirPath) {
  var fileList = fs.readdirSync(dirPath);

  // Ignore the .git file if it exists
  var gitIdx = fileList.indexOf(".git");
  if (gitIdx > -1){
    fileList.splice(gitIdx, 1);
  }

  // Ignore the .gitignore file if it exists
  var gitignoreIdx = fileList.indexOf(".gitignore");
  if (gitignoreIdx > -1){
    fileList.splice(gitignoreIdx, 1);
  }
  
  return fileList;
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function validateRepositoryStructure () {
  checkAndCreateDir(repoDirPath);
  checkAndCreateDir(exportDirPath);
  
  var modelDirList = getRepositoryFileList(exportDirPath);
  
  // Remove model directories that are no longer needed
  for (var dirIdx in modelDirList) {
    var modelDirName = modelDirList[dirIdx];
    if (!modelConfig[modelDirName]) {
      console.log("::: Removing stored directory for " + modelDirName);
      deleteFolderRecursive(exportDirPath + "/" + modelDirName);
    }
  }
  
  // Check for the model directories
  for(var modelName in modelConfig){
    var modelDirPath = exportDirPath + "/" + modelName;
    checkAndCreateDir(modelDirPath);
  }
  
  kdbStore = {
    ids: {},
    models: {}
  };
  
  var modelDirList = getRepositoryFileList(exportDirPath);
  for(var modelIdx in modelDirList){
    var modelName = modelDirList[modelIdx];
    var modelDirPath = exportDirPath + "/" + modelName;
    var modelStore ={};
    kdbStore.models[modelName] = modelStore;
    var fileList = getRepositoryFileList(modelDirPath);
    for(var fileIdx in fileList) {
      var fileData = fs.readFileSync(modelDirPath + "/" + fileList[fileIdx], {encoding: 'utf8', flag: 'r'});
      var itemRow =  JSON.parse(fileData);
      modelStore[itemRow.id] = JSON.stringify(itemRow);
    }
    kdbStore.ids[modelName] = fileList.length;
  }
}

//////////////////////////////////////////////////////////////////////////
// main processing
//////////////////////////////////////////////////////////////////////////

// Read the model config
modelConfig = loadJSONDoc("server/model-config.json");

// Ignore the loopback _meta
if (modelConfig._meta) {
  delete modelConfig._meta;
}

console.log(modelConfig);

console.log("::: Validating Repository Structure")
validateRepositoryStructure();
storeJSONDoc(repoDirPath + "/kdbStore.json", kdbStore);

console.log("::: Reading db.json");
var lbStore = loadJSONDoc("db.json");
storeJSONDoc(repoDirPath + "/lbStore.json", lbStore);

console.log("::: End KDB File Load");
