'use strict';
import { ItemProxy } from "../common/src/item-proxy";
import { ItemCache } from "../common/src/item-cache";
import { TreeConfiguration } from "../common/src/tree-configuration";
import { TreeHashMap } from "../common/src/tree-hash";


//Paths may be provided via arguments when starting via -kdb=PATH
var baseRepoPath : string;
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
var kdb = require('../server/kdb');
global['koheseKDB'] = kdb;
let indexAndExit = true;
kdb.initialize(baseRepoPath, indexAndExit).then(function () {
  console.log('::: Finished cache update for: ' + baseRepoPath);
  let itemCache : ItemCache = TreeConfiguration.getItemCache();

  console.log('::: Detecting missing data in cache');
  try {
    itemCache.detectMissingCommitData();
  } catch (err){
    console.log('*** Error: ' + err);
    console.log(err.stack);
  }

});
