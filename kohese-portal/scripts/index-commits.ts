/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


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
