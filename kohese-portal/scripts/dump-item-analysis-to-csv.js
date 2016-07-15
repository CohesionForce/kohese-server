
console.log(process.argv);

var KDB = require('../server/kdb.js');

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


console.log("KUID,Parent KUID,Child Count,Name,Sentence ID, Text");
var displayItem = function(proxy){
  var onId = proxy.item.id;
  var itemPrefix = proxy.item.id + ",|" + proxy.item.parentId + "|,|" + proxy.children.length + "|,|" + proxy.item.name;
  console.log(itemPrefix + "|,|" + "N/A" + "|,|" + proxy.item.description + "|");
  var analysis = KDB.retrieveModelInstance("Analysis", onId);
//  console.log("Analysis:");
//  for(var analysisKey in analysis){
//    console.log("Key: " + analysisKey);
//  }
  for(var listIdx in analysis.list){
    var listItem = analysis.list[listIdx];
    if(listItem.displayType === 'Sentence'){
      console.log(itemPrefix + "|,|" + listItem.displayId + "|,|" + listItem.text + "|");
//      console.log(listItem);
    }
  }
};

document.visitDescendants(displayItem);
