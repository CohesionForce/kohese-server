
console.log(process.argv);

var KDB = require('../server/kdb.js');
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

var document = KDB.ItemProxy.getProxyFor(forItemId);
console.log("::: Found proxy: " + document.item.name);


console.log("KUID,Name,Sentence ID, Text");
var displayItem = function(proxy){
  var onId = proxy.item.id;
  var fullItem = proxy.item.id + ",|" + proxy.item.name + "|,|" + "Item" + "|,|" + proxy.item.description + "|";

  var nameSplit = proxy.item.name.match(parseHeaderName);
  var itemNum = nameSplit[1];
  var itemNameText = nameSplit[3];
  console.log(proxy.item.id + ":N,|" + itemNum + "|,|" + "Heading" + "|,|"  + itemNameText + "|");
  console.log(fullItem);

  var analysis = KDB.retrieveModelInstance("Analysis", onId);
//  console.log("Analysis:");
//  for(var analysisKey in analysis){
//    console.log("Key: " + analysisKey);
//  }
  for(var listIdx in analysis.list){
    var listItem = analysis.list[listIdx];
    if(listItem.displayType === 'Sentence' && isDescriptionSentence.test(listItem.displayId)){
      var displayIdSplit = listItem.displayId.match(isDescriptionSentence);
      console.log(proxy.item.id + ":D" + displayIdSplit[1] + ",|" + itemNum + "|,|" + "Description:" + displayIdSplit[1] + "|,|" + listItem.text + "|");
//      console.log(listItem);
    }
  }
};

document.visitDescendants(displayItem);
