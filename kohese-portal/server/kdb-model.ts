/**
 *
 */

var kdbFS = require('./kdb-fs');
var jsonExt = /\.json$/;
var modelDefinitions = {
  model: {}, 
  view: {}
};

module.exports.modelDefinitions = modelDefinitions;

console.log('::: Loading model definitions');
var modelDefDirPath = 'common/models';
var modelDefFileList = kdbFS.getRepositoryFileList(modelDefDirPath, jsonExt);

for(var modelDefIdx in modelDefFileList){
  var modelDefFile = modelDefFileList[modelDefIdx];
  console.log('::: Processing model def file: ' + modelDefFile);
  var modelDefDoc = kdbFS.loadJSONDoc(modelDefDirPath + '/' + modelDefFile);
  modelDefinitions.model[modelDefDoc.name]=modelDefDoc;
}

console.log('::: Loading view-model definitions');
var viewDefDirPath = 'common/views';
var viewDefFileList = kdbFS.getRepositoryFileList(viewDefDirPath, jsonExt);

for(var viewDefIdx in viewDefFileList){
  var viewDefFile = viewDefFileList[viewDefIdx];
  console.log('::: Processing view model def file: ' + viewDefFile);
  var viewDefDoc = kdbFS.loadJSONDoc(viewDefDirPath + '/' + viewDefFile);
  modelDefinitions.view[viewDefDoc.name]=viewDefDoc;
}

