/**
 * Knowledge Database File System
 */

var fs = require('fs');

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function loadJSONDoc(filePath) {

//  console.log('::: Loading ' + filePath);

  try {
    var fileData = fs.readFileSync(filePath, {encoding: 'utf8', flag: 'r'});
    var jsonObject = JSON.parse(fileData);
    return jsonObject;
  } catch (err){
    console.log('*** Error processing file:  ' + filePath);
    throw err;
  }

}

module.exports.loadJSONDoc = loadJSONDoc;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function storeJSONDoc(filePath, doc) {

//  console.log('::: Storing ' + filePath);

  fs.writeFileSync(filePath, JSON.stringify(doc, null, '  '), {encoding: 'utf8', flag: 'w'});
}

module.exports.storeJSONDoc = storeJSONDoc;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function loadBinaryFile(filePath) {

//  console.log('::: Loading ' + filePath);

  var fileData = fs.readFileSync(filePath);

  return fileData;
}

module.exports.loadBinaryFile = loadBinaryFile;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function storeBinaryFile(filePath, binFile) {

//  console.log('::: Storing ' + filePath);

  fs.writeFileSync(filePath, binFile);
}

module.exports.storeBinaryFile = storeBinaryFile;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function createEmptyFileIfMissing(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log('::: Creating ' + filePath);
    storeJSONDoc(filePath, '');
  }
}

module.exports.createEmptyFileIfMissing = createEmptyFileIfMissing;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function createGITIgnoreJSONIfMissing(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log('::: Creating .gitignore for *.json ' + filePath);
    fs.writeFileSync(filePath, '*.json', {encoding: 'utf8', flag: 'w'});
  }
}

module.exports.createGITIgnoreJSONIfMissing = createGITIgnoreJSONIfMissing;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function createGITIgnoreAllIfMissing(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log('::: Creating .gitignore for directory as ' + filePath);
    fs.writeFileSync(filePath, '*', {encoding: 'utf8', flag: 'w'});
  }
}

module.exports.createGITIgnoreAllIfMissing = createGITIgnoreAllIfMissing;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function createDirIfMissing(dirName) {
  if (!fs.existsSync(dirName)) {
    console.log('::: Creating ' + dirName);
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
      // eslint-disable-next-line no-unused-vars
      files.forEach(function(file,index){
          var curPath = dirPath + '/' + file;
          if(fs.lstatSync(curPath).isDirectory()) { // recurse
              deleteFolderRecursive(curPath);
          } else { // delete file
              fs.unlinkSync(curPath);
          }
      });
      fs.rmdirSync(dirPath);
  }
}

module.exports.deleteFolderRecursive = deleteFolderRecursive;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function removeFile(filePath, ignoreNonExistent) {

  if (fs.existsSync(filePath)){
    console.log('::: Removing existing file: ' + filePath);
    fs.unlinkSync(filePath);
  } else {
    if(!ignoreNonExistent){
      // TODO need to convert this to a exception in the future
      console.log('*** Attempt to remove non-existent file:  ' + filePath);
    }
  }
}

module.exports.removeFile = removeFile;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function getRepositoryFileList(dirPath, fileRegEx) {
  var fileList = fs.readdirSync(dirPath);

  // Ignore the following files if they exist
  var ignoreList = ['.git', '.gitignore', '.npmignore', 'Root.json', 'mounts.json', '.project'];
  ignoreFiles(ignoreList);
  function ignoreFiles(names) {
      var index;
      for(var i = 0; i < names.length; i++) {
          index = fileList.indexOf(names[i]);
          if(index > -1) {
              fileList.splice(index, 1);
          }
      }
  }

  // Filter the list if fileRegEx is supplied
  if (fileRegEx){
    var filteredList = [];
    for(var fileIdx = 0; fileIdx < fileList.length; fileIdx++){
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
