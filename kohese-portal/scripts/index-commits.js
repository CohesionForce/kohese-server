'use strict';

//Paths may be provided via arguments when starting via -kdb=PATH
var baseRepoPath;
for (var i = 2; i < process.argv.length; i++) {
  var arg = process.argv[i].split('=');
  if((arg[0] === '-kdb') && (arg[1] !== '')) {
    baseRepoPath = arg[1];
    break;
  }
}

if (!baseRepoPath){
  console.log('*** KDB repo must be supplied');
  console.log('usage: node scripts/index-commits.js -kdb=repo-subdir');
  process.exit(1);
}

//////////////////////////////////////////////////////////////////////////
// Main Processing
//////////////////////////////////////////////////////////////////////////

// Load the KDB
var kdb = require('../server/kdb.js');
global.koheseKDB = kdb;
kdb.initialize(baseRepoPath).then(function () {
  console.log('::: Finished cache update fir: ' + baseRepoPath);
});
