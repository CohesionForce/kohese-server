// Usage: node scripts/dump-item-to-markdown.js <itemId> <outFormat> --showUndefined
console.log(process.argv);

var KDB = require('../server/kdb.js');
var fs = require('fs');
var path = require('path');
var child = require('child_process');
var parseHeaderName=/(([0-9]*\.*)*)\s*(.*)/;
var isDescriptionSentence=/^description\-Sentence-(.*)$/;

var forItemId = "";
var outFormat;
var showUndefined = false;

if(process.argv[2]){
  forItemId=process.argv[2];
} else {
  console.log("*** Need to supply item id to be dumped");
  process.exit();
}

if(process.argv[3]) {
	outFormat = process.argv[3];
}

for (var i in process.argv) {
	if (process.argv[i] === '--showUndefined') {
		showUndefined = true;
	}
}
// End argument processing

var document = KDB.ItemProxy.getWorkingTree().getProxyFor(forItemId);
if (!document) {
	console.log('!!! Item id not found.')
	process.exit();
}

console.log("::: Found proxy for: " + forItemId + " - " + document.item.name);

var reportTime = new Date();

var outputBuffer = "::: Dump of " + forItemId + ": " + document.item.name + " at " + reportTime.toDateString() + " " + reportTime.toTimeString() + "\n\n";

outputBuffer += document.getDocument(showUndefined);

var dumpFile= "tmp_reports/dump." + forItemId + "." + document.item.name + ".md";
fs.writeFileSync(dumpFile, outputBuffer, {encoding: 'utf8', flag: 'w'});

if (outFormat) {
	console.log('::: Now spawning pandoc...');
	console.log('::: Creating ' + 'tmp_reports/' + path.basename(dumpFile, '.md') + '.' + outFormat);
	var pandoc = child.spawnSync('pandoc', ['-f', 'markdown', '-t', outFormat, dumpFile, '-o', 'tmp_reports/' + path.basename(dumpFile, '.md') + '.' + outFormat], { cwd: path.normalize(__dirname + '/..'), encoding : 'utf8' });
	if(pandoc.stdout) {
		console.log(pandoc.stdout);
	}
	console.log('Pandoc done!');
}


