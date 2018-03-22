var kdbCache = require('../server/kdb-cache.js');

const repositoryPath = process.argv[2];

//////////////////////////////////////////////////////////////////////////
// Main Processing
//////////////////////////////////////////////////////////////////////////

// Load Cached Objects From Prior Runs
var beforeTime = Date.now();
kdbCache.loadCachedObjects();
var afterTime = Date.now();
var deltaLoadTime = afterTime-beforeTime;

beforeTime = Date.now();
kdbCache.generateCommitHistoryIndices(repositoryPath).then(() => {
  afterTime = Date.now();
  var deltaUpdateTime = afterTime-beforeTime;
  console.log('::: Finished Indexing');
  console.log('--- Load Cached Objects Time:   ' + deltaLoadTime/1000);
  console.log('--- Update Cached Objects Time: ' + deltaUpdateTime/1000);
});
