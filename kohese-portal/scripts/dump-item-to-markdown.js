
console.log(process.argv);

var KDB = require('../server/kdb.js');
var fs = require('fs');
var parseHeaderName=/(([0-9]*\.*)*)\s*(.*)/;
var isDescriptionSentence=/^description\-Sentence-(.*)$/;

var forItemId = "";

if(process.argv[2]){
  forItemId=process.argv[2];
} else {
  console.log("*** Need to supply item id to be dumped");
}


var document = KDB.ItemProxy.getProxyFor(forItemId);

console.log("::: Found proxy for: " + forItemId + " - " + document.item.name);

var outputBuffer = "::: Dump of " + forItemId + ": " + document.item.name + "\n\n";

var displayItem = function(proxy){

  var depth = proxy.getDepthFromAncestor(document);
  var hdr = "";

  for(var idx = 0; idx < depth; idx++){
    hdr += "#";
  }

  console.log("::: Dumping " + proxy.item.name);
  outputBuffer += hdr + " " + proxy.item.name + "\n" + proxy.item.description + "\n\n";
  
};

document.visitDescendants(displayItem);

var dumpFile= "tmp/dump." + forItemId + "." + document.item.name + ".md";
fs.writeFileSync(dumpFile, outputBuffer, {encoding: 'utf8', flag: 'w'});

