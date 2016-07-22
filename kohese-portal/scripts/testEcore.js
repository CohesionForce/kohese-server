//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
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

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function processFile(file) {
	var resourceSet = Ecore.ResourceSet.create();
	var resource = resourceSet.create({uri : './testFile.kfile'});

	var fileContents = fs.readFileSync(file, 'utf8');
	try { 
		resource.parse(fileContents, Ecore.XMI);
	} catch(err) {
		console.log('*** Failed parsing file: ' + file);
		console.trace(err);
	    return;
	}
	console.log("::: Sync Version");

	var firstElement = resource.get('contents').first();
	if(firstElement.eClass.values.name === 'EPackage') {
		console.log("::: Adding to registry: " + firstElement.get('name'));
		Ecore.EPackage.Registry.register(firstElement);
		displayModelInfo(resource);
	}
	
	var result = resource.to(Ecore.JSON);
	console.log("::: JSON Dump of " + file);
	console.log(util.inspect(result, false, null));
}

//////////////////////////////////////////////////////////////////////////
//  Main Processing
//////////////////////////////////////////////////////////////////////////

fs = require('fs');
util = require('util');
var Ecore = require('ecore/dist/ecore.xmi');

console.log(process.argv.length);
for(var argidx = 2; argidx < process.argv.length; argidx++) {
	var fileName = process.argv[argidx];
	console.log('::: Processing ' + fileName);
	processFile(fileName);
}