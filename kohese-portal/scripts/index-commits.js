var nodegit = require('nodegit');
var path = require('path');
const fs = require('fs');
const ItemProxy = require('../common/models/item-proxy.js');
var kdbFS = require('../server/kdb-fs.js');
var _ = require('underscore');

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

generateCommitHistoryIndices(repositoryPath, false).then(() => {
  console.log('::: Finished Indexing');
});

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
//TODO overwrite flag does not appear to do anything
function generateCommitHistoryIndices(p, overwrite) {
  return nodegit.Repository.open(p).then(function (r) {
    return r.getMasterCommit().then(function (mc) {
      var rw = nodegit.Revwalk.create(r);
      rw.sorting(nodegit.Revwalk.SORT.TIME);
      rw.push(mc.id());
      return rw.getCommitsUntil(function (c) {
        return true;
      }).then(function (commits) {
        return indexCommit(r, commits);
      });
    });
  });
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function indexCommit(repository, commits) {
  var commit = commits.shift();

  // Exit recursion after all commits have been processed  
  if(!commit){
    return;
  }
  
  if (kdbCache.cachedCommit(commit.id())){
    console.log('::: Already indexed commit ' + commit.id());
    return indexCommit(repository, commits);      
  } else {
    console.log('::: Processing commit ' + commit.id());
    
    var beforeCommitTime = Date.now();

    return commit.getTree().then(function (tree) {
      var co = {
        time: commit.timeMs(),
        author: commit.author().toString(),
        message: commit.message(),
        parents: [],
        treeId: tree.id().toString()
      };
      for (var j = 0; j < commit.parentcount(); j++) {
        co.parents.push(commit.parentId(j).toString());
      }
      
      var commitDataPromise = new Promise((resolve, reject) => {
        parseTree(repository, tree).then(() => {
          resolve(co);
        });        
      });
      
      return commitDataPromise;
    }).then(function (co) {
      
      console.log('::: Loaded commit ' + commit.id());
      var afterCommitTime = Date.now();
      var deltaCommitTime = afterCommitTime-beforeCommitTime;
      console.log('--- Commit Read Time: ' + deltaCommitTime/1000);

      kdbCache.addCachedObject('commit', commit.id(), co);
      
      return indexCommit(repository, commits);
    }).catch(function (err) {
      console.log(err.stack);
    });
  }  
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function parseTree(repository, tree) {
  var promises = [];
  var entries = {};
  for (var j = 0; j < tree.entryCount(); j++) {
    var entry = tree.entryByIndex(j);
    
    entries[entry.name()] = {
        type: (entry.isTree() ? 'tree' : 'blob'),
        oid: entry.sha()
    };
    
    if (entry.isTree()) {
      // Retrieve subtree if it is not already cached
      if (!kdbCache.cachedTree(entry.sha())){
        promises.push(entry.getTree().then(function (t) {
          return parseTree(repository, t);
        }));
      }
    } else {
      // Retrieve Blob if it is not already cached
      var oid = entry.sha();
      if (!kdbCache.cachedBlob(oid)){
        promises.push(getContents(repository, oid));       
      }
    }
  }
  
  kdbCache.addCachedObject('tree', tree.id(), entries);
  
  return Promise.all(promises);
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function getContents(repository, oid) {
  return nodegit.Blob.lookup(repository, nodegit.Oid
    .fromString(oid)).then(function (blob) {
      kdbCache.addCachedObject('blob', oid, blob.content());
      return Promise.resolve(oid);
  }).catch(function (err) {
    console.log('*** Error retreiving: ' + oid);
    console.log(err.stack);
  });
}
