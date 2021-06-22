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
var parseHeaderName=/(([0-9]*\.*)*)\s*(.*)/;
var isDescriptionSentence=/^description\-Sentence-(.*)$/;

var forItemId="db13bfc0-ae41-11e5-af49-9b039241499e";

if(process.argv[2]){
  forItemId=process.argv[2];
  console.log("::: Changing item id to: " + forItemId);
} else {
  console.log("::: Using default item id");
}

console.log("::: Begin dumping for " + forItemId);

var document = KDB.ItemProxy.getWorkingTree().getProxyFor(forItemId);
console.log("::: Found proxy: " + document.item.name);


var outputBuffer = "KUID,Name,Tag,Sentence ID, Text\n";

var displayItem = function(proxy){
  var onId = proxy.item.id;
  var fullItem = proxy.item.id + ",|" + proxy.item.name + "|,|" + proxy.item.tags + "|,|" + "Item" + "|,|" + proxy.item.description + "|\n";

  var nameSplit = proxy.item.name.match(parseHeaderName);
  var itemNum = nameSplit[1];
  var itemNameText = nameSplit[3];
  outputBuffer += proxy.item.id + ":N,|" + itemNum + "|,|" + proxy.item.tags + "|,|" + "Heading" + "|,|"  + itemNameText + "|\n";
  outputBuffer += fullItem;

  var analysis = KDB.retrieveModelInstance("Analysis", onId);
//  console.log("Analysis:");
//  for(var analysisKey in analysis){
//    console.log("Key: " + analysisKey);
//  }
  for(var listIdx in analysis.list){
    var listItem = analysis.list[listIdx];
    if(listItem.displayType === 'Sentence' && isDescriptionSentence.test(listItem.displayId)){
      var displayIdSplit = listItem.displayId.match(isDescriptionSentence);
      outputBuffer += proxy.item.id + ":D" + displayIdSplit[1] + ",|" + itemNum + "|,|" + proxy.item.tags + "|,|" + "Description:" + displayIdSplit[1] + "|,|" + listItem.text + "|\n";
//      console.log(listItem);
    }
  }
};

document.visitDescendants(displayItem);

var dumpFile= "tmp_reports/vcrm." + forItemId + "." + document.item.name + ".csv";
fs.writeFileSync(dumpFile, outputBuffer, {encoding: 'utf8', flag: 'w'});
