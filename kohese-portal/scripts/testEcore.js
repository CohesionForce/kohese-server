/**
 * 
 */

fs = require('fs');
util = require('util');
var Ecore = require('ecore/dist/ecore.xmi');

console.log(process.argv);

var forModelFile = '';
var forInstanceFile;

if(process.argv[2]){
  forModelFile=process.argv[2];
} else {
  forModelFile='../kohese-design/model/Kohese.ecore';  
  console.log('!!! Should supply ecore/xmi file to be dumped.');
}

if (process.argv[3]) {
  forInstanceFile = process.argv[3];
}

console.log("::: Testing Ecore.  Using: " + forModelFile);

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
      console.log('*** Failed loading model: ', err);
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

var kModelFile = fs.readFileSync(forModelFile, 'utf8');
resource.parse(kModelFile, Ecore.XMI);
console.log("::: Sync Version");
//var ePackage2 = resource.get('contents').first();
//console.log('loaded ePackage2', ePackage2.get('name'));
displayModelInfo(resource);

var result = resource.to(Ecore.JSON);
console.log("::: JSON Dump of " + forModelFile);
console.log(util.inspect(result, false, null));

if (forInstanceFile) {
	console.log('::: Processing instance:  ' + forInstanceFile);
	
	var kPackage = resource.get('contents').first();
	Ecore.EPackage.Registry.register(kPackage);
	
	var instanceRS = Ecore.ResourceSet.create();
	var instanceResource = instanceRS.create({uri : './testFile.kifile'});
	var kInstanceFile = fs.readFileSync(forInstanceFile, 'utf8');
	instanceResource.load(kInstanceFile, function(instance, err){
		if (err) {
		      console.log('*** Failed loading model instance: ', err);
		      return;
		  }
		
		var iResult = instance.to(Ecore.JSON);
		console.log("::: JSON Dump of " + forInstanceFile);
		console.log(util.inspect(iResult, false, null));
	}, {format: Ecore.XMI});
}