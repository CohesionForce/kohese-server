/**
 * 
 */

fs = require('fs');
util = require('util');
var Ecore = require('ecore/dist/ecore.xmi');

console.log(process.argv);

var forFile = '';

if(process.argv[2]){
  forFile=process.argv[2];
} else {
  forFile='../kohese-design/model/KoheseTypes.ecore';  
  console.log('*** Need to supply item id to be dumped.');
  
}

console.log("::: Testing Ecore.  Using: " + forFile);

function displayModelInfo(model) {
  var ePackage = model.get('contents').first();

  console.log('loaded ePackage', ePackage.get('name'));
  console.log('eClassifiers', ePackage.get('eClassifiers').map(function(c) {
      return c.get('name') + ' superTypes(' + c.get('eSuperTypes').map(function(s) {
          return s.get('name');
      }).join(', ') + ') features(' + c.get('eStructuralFeatures').map(function(f) {
          return f.get('name') + ' : ' + f.get('eType').get('name');
      }).join(', ') + ')';
  }));  
}

var callback = function(model, err) {
  if (err) {
      console.log('fail loading model', err);
      return;
  }

  displayModelInfo(model);
};

// Processing Asynchronously
//fs.readFile('../kohese-design/model/KoheseTypes.ecore', 'utf8', function (err,data) {
//  if (err) return console.log(err);
//
//  Ecore.Resource.create({ uri: '../kohese-design/model/KoheseTypes.ecore' }).load(data, callback, {format: Ecore.XMI});
//});

// Processing Synchronously
var resourceSet = Ecore.ResourceSet.create();
var resource = resourceSet.create({uri : './testFile.kfile'});

var kModelFile = fs.readFileSync(forFile, 'utf8');
resource.parse(kModelFile, Ecore.XMI);
console.log("::: Sync Version");
//var ePackage2 = resource.get('contents').first();
//console.log('loaded ePackage2', ePackage2.get('name'));
displayModelInfo(resource);

var result = resource.to(Ecore.JSON);
console.log("::: JSON Dump of " + forFile);
console.log(util.inspect(result, false, null));
