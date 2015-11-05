/**
 * Knowledge Database File System
 */

var fs = require('fs');

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function loadJSONDoc(filePath) {

//  console.log("::: Loading " + filePath);

  var fileData = fs.readFileSync(filePath, {encoding: 'utf8', flag: 'r'});
  var jsonObject = JSON.parse(fileData);

  return jsonObject;
}

module.exports.loadJSONDoc = loadJSONDoc;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function storeJSONDoc(filePath, doc) {

  console.log("::: Storing " + filePath);

  fs.writeFileSync(filePath, JSON.stringify(doc, null, '  '), {encoding: 'utf8', flag: 'w'});  
}

module.exports.storeJSONDoc = storeJSONDoc;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function createEmptyFileIfMissing(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log("::: Creating " + filePath);
    storeJSONDoc(filePath, "");
  }
}

module.exports.createEmptyFileIfMissing = createEmptyFileIfMissing;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function createDirIfMissing(dirName) {
  if (!fs.existsSync(dirName)) {
    console.log("::: Creating " + dirName);
    fs.mkdirSync(dirName);
  }
}

module.exports.createDirIfMissing = createDirIfMissing;

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

module.exports.deleteFolderRecursive = deleteFolderRecursive;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function removeFile(filePath) {

  console.log("::: Removing " + filePath);
  fs.unlinkSync(filePath);

}

module.exports.removeFile = removeFile;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function getRepositoryFileList(dirPath, fileRegEx) {
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

  // Filter the list if fileRegEx is supplied
  if (fileRegEx){
    var filteredList = [];
    for(var fileIdx in fileList){
      var fileName = fileList[fileIdx];
      if(fileRegEx.test(fileName)){
        filteredList.push(fileName);
      }
    }
    fileList = filteredList;
  }
  
  return fileList;
}

module.exports.getRepositoryFileList = getRepositoryFileList;
