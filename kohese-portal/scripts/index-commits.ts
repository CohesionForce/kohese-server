'use strict';
import { LevelCache } from '../common/src/level-cache';


// Paths may be provided via arguments when starting via -kdb=PATH
var baseRepoPath = 'kohese-kdb';
for (var i = 2; i < process.argv.length; i++) {
  var arg = process.argv[i].split('=');
  if((arg[0] === '-kdb') && (arg[1] !== '')) {
    baseRepoPath = arg[1];
    break;
  }
}

//////////////////////////////////////////////////////////////////////////
// Main Processing
//////////////////////////////////////////////////////////////////////////

// Load the KDB
var kdb = require('../server/kdb');
global['koheseKDB'] = kdb;
let indexAndExit = true;
kdb.initialize(baseRepoPath, indexAndExit).then(async () =>  {
  console.log('::: Finished cache update for: ' + baseRepoPath);
  let itemCache : LevelCache = <LevelCache>LevelCache.getItemCache();

  console.log('::: Checking for missing data in cache');
  try {
    const missingCacheData = await itemCache.analysis.detectAllMissingData();
    if (missingCacheData.found) {
      console.log('*** Missing cache data');
      console.log(JSON.stringify(missingCacheData, null, '  '));
    } else {
      console.log('::: No missing cache data was detected');
    }
  } catch (err){
    console.log('*** Error: ' + JSON.stringify(err));
    console.log(err);
    console.log(err.stack);
  }
  console.log('::: Indexing complete');

});
