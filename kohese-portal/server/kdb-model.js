/**
 * 
 */

var kdbFS = require('./kdb-fs.js');
var jsonExt = /\.json$/;
var modelDef = {};
module.exports.modelDef = modelDef;

console.log('::: Loading model definitions');
var modelDefDirPath = 'common/models';
var modelDefFileList = kdbFS.getRepositoryFileList(modelDefDirPath, jsonExt);

for(var modelDefIdx in modelDefFileList){
  var modelDefFile = modelDefFileList[modelDefIdx];
  console.log('::: Processing model def file: ' + modelDefFile);
  var modelDefDoc = kdbFS.loadJSONDoc(modelDefDirPath + '/' + modelDefFile);
  modelDef[modelDefDoc.name]=modelDefDoc;
}

//console.log('::: modelDef');
//console.log(JSON.stringify(modelDef, null, '  '));
