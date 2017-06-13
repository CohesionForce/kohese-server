
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

var document = KDB.ItemProxy.getProxyFor(forItemId);
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

var dumpFile = "tmp_reports/analysis." + forItemId + "." + document.item.name + ".csv";

fs.writeFileSync(dumpFile, outputBuffer, {encoding: 'utf8', flag: 'w'});

