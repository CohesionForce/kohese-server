var kdbCache = require('../server/kdb-cache.js');

const repositoryPath = process.argv[2];

//////////////////////////////////////////////////////////////////////////
// Main Processing
//////////////////////////////////////////////////////////////////////////

// Load Cached Objects From Prior Runs
var beforeTime = Date.now();
kdbCache.loadCachedObjects();
var afterTime = Date.now();
var deltaTime = afterTime-beforeTime;
console.log('--- Load Cached Objects Time: ' + deltaTime/1000);

kdbCache.generateCommitHistoryIndices(repositoryPath).then(() => {
  console.log('::: Finished Indexing');
});
