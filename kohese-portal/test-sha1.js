

var SHA = require('jssha');
var kdbFS = require('./server/kdb-fs.js');

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  function gitDocumentOID(forDoc, expectedOID) {
    var shaObj = new SHA('SHA-1', 'TEXT');

    var forText = JSON.stringify(forDoc, null, '  ');
    let target = forDoc;

    // console.log(forText);
    console.log('Expect: ' + expectedOID);
    // console.log(JSON.stringify(forDoc));
    // console.log(forDoc);
    // console.log(forDoc.data);
    // console.log(JSON.parse(target));
    // console.log(target);
    var length = target.length;
    // console.log(forText);

    let value = 'blob ' + length + '\0' + target;
    // console.log(value);
    shaObj.update(value);

    var oid = shaObj.getHash('HEX');
    console.log('oid: ' + oid);

    if(oid !== expectedOID){
      console.log('$$$ oid doesn\'t match');
    } else {
      console.log('$$$ oid matches');
    }

    return oid;
  }


//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
let expectedOIDa1 = 'ffba17b313884a6e5685fd6a5c40a5bbc0a0b11c';
let expectedOIDa2 = '91765060308badeaa3b44341bc19efff0fb5eb26';
let expectedOIDb  = '035ac2b6392a6db82fa8487610628666368aef3f';

var objecta1 = kdbFS.loadBinaryFile('./a1.txt');
var objecta2 = kdbFS.loadBinaryFile('./a2.txt');
var objectb1 = kdbFS.loadBinaryFile('./b1.txt');
var objectb2 = kdbFS.loadBinaryFile('./b2.txt');



let calcOID;

calcOID = gitDocumentOID(objecta1, expectedOIDa1);
calcOID = gitDocumentOID(objecta2, expectedOIDa2);
calcOID = gitDocumentOID(objectb1, expectedOIDb);
calcOID = gitDocumentOID(objectb2, expectedOIDb);
