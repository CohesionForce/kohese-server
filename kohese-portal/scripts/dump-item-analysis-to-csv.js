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



console.log(process.argv);

var KDB = require('../server/kdb.js');
var fs = require('fs');

var forItemId="ERROR_NO_ID_SUPPLIED";
if(process.argv[2]){
  forItemId=process.argv[2];
  console.log("::: Changing item id to: " + forItemId);
} else {
  console.log("*** Item ID was not supplied");
  process.exit();
}

console.log("::: Begin dumping for " + forItemId);

var document = KDB.ItemProxy.getWorkingTree().getProxyFor(forItemId);
console.log("::: Found proxy: " + document.item.name);


var outputBuffer="KUID,Parent KUID,Child Count,Name,Sentence ID,Type,Text\n";
var displayItem = function(proxy){
  var onId = proxy.item.id;
  var itemPrefix = proxy.item.id + ",|" + proxy.item.parentId + "|,|" + proxy.children.length + "|,|" + proxy.item.name;
  outputBuffer += itemPrefix + "|,|" + "N/A" + "|,|Section|,|" + proxy.item.description + "|\n";
  var analysis = KDB.retrieveModelInstance("Analysis", onId);
//  console.log("Analysis:");
//  for(var analysisKey in analysis){
//    console.log("Key: " + analysisKey);
//  }
  for(var listIdx in analysis.list){
    var listItem = analysis.list[listIdx];
    if(listItem.displayType === 'Sentence'){
      outputBuffer += itemPrefix + "|,|" + listItem.displayId + "|,|Sentence|,|" + listItem.text + "|\n";
//      console.log(listItem);
    } else if (listItem.chunkType)  {
      outputBuffer += itemPrefix + "|,|" + listItem.displayId + "|,|" + listItem.displayType + "|,|" + listItem.text + "|\n";
//      console.log(listItem);
    }

  }
};

document.visitDescendants(displayItem);

var itemName = document.item.name.replace(/[:\/]/g, " ");

var dumpFile = "tmp_reports/analysis." + forItemId + "." + itemName + ".csv";

console.log("::: Writing to " + dumpFile);

fs.writeFileSync(dumpFile, outputBuffer, {encoding: 'utf8', flag: 'w'});

