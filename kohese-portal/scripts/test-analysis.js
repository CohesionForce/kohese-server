var KDB = require('./server/kdb.js');

var analysis = KDB.retrieveModelInstance("Analysis", "cb35dab0-9263-11e5-9cb4-0bba35a515d6");

function printParseObject(parseObject, fss, pad){
  if (parseObject.parseType !== "TK") {
    console.log(pad + parseObject.parseType + " - " + parseObject.text );
    var childPad = "  " + pad;
    for (var childIdx in parseObject.children){
       printParseObject(fss[parseObject.children[childIdx]], fss, childPad);
    }
  }
}

for (var subjectIdx in analysis.raw) {
  var subject = analysis.raw[subjectIdx];

  console.log("::: Parse of " +subjectIdx);

  var parse = subject._views._InitialView.Parse;
  var fss = subject._referenced_fss; 

  for (var parseIdx in parse) {
    entryType = typeof parse[parseIdx];
    if (entryType === "object") {
      console.log(parseIdx + " => " + entryType);
      printParseObject(parse[parseIdx], fss, "  ");
    }
  }
}
