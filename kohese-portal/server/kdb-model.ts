/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


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

