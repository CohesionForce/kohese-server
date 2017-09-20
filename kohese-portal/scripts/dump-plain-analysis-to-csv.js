
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


var outputBuffer="";
var displayItem = function(proxy){
  var onId = proxy.item.id;
  var analysis = KDB.retrieveModelInstance("Analysis", onId);
//  console.log("Analysis:");
//  for(var analysisKey in analysis){
//    console.log("Key: " + analysisKey);
//  }
  for(var listIdx in analysis.list){
    var listItem = analysis.list[listIdx];
    if(listItem.displayType === 'Sentence'){
      outputBuffer += listItem.text + "\n";
//      console.log(listItem);
    } else if (listItem.chunkType)  {
      // Output nothing
    }

  }
};

document.visitDescendants(displayItem);

var itemName = document.item.name.replace(/[:\/]/g, " ");

var dumpFile = "tmp_reports/plain-analysis." + forItemId + "." + itemName + ".csv";

console.log("::: Writing to " + dumpFile);

fs.writeFileSync(dumpFile, outputBuffer, {encoding: 'utf8', flag: 'w'});

