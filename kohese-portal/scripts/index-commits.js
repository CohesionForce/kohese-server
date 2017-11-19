var nodegit = require('nodegit');
var path = require('path');
const fs = require('fs');
const ItemProxy = require('../common/models/item-proxy.js');
var kdbFS = require('../server/kdb-fs.js');
var _ = require('underscore');

const repositoryPath = process.argv[2];

const CACHE_DIRECTORY = path.join('kdb', 'cache');
const OBJECT_DIRECTORY = path.join(CACHE_DIRECTORY, 'git-object');
const COMMIT_DIRECTORY = path.join(OBJECT_DIRECTORY, 'commit');
const BLOB_DIRECTORY = path.join(OBJECT_DIRECTORY, 'blob');
const TREE_DIRECTORY = path.join(OBJECT_DIRECTORY, 'tree');

kdbFS.createDirIfMissing(CACHE_DIRECTORY);
kdbFS.createDirIfMissing(OBJECT_DIRECTORY);
kdbFS.createDirIfMissing(COMMIT_DIRECTORY);
kdbFS.createDirIfMissing(BLOB_DIRECTORY);
kdbFS.createDirIfMissing(TREE_DIRECTORY);

var repoObjects = {
  blob: {},
  tree: {},
  commit: {}
};

var repoBlob = repoObjects.blob;
var repoTree = repoObjects.tree;
var repoCommit = repoObjects.commit;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function loadCachedObjects(repoBlobs) {
  console.log('::: Loading cached objects');
  var oidFiles = kdbFS.getRepositoryFileList(BLOB_DIRECTORY);

  oidFiles.forEach((oid) => {
    try {
      var object = kdbFS.loadBinaryFile(BLOB_DIRECTORY + '/' + oid);
      var koid = ItemProxy.gitFileOID(object);
      if (oid !== koid){
        console.log('Mismatch for ' + oid + ' - ' + koid);        
      }
      repoObjects.blob[oid] = object;
    } catch (err) {
      console.log('*** Could not load cached blob:  ' + oid);
      console.log(err);
    }
  });
  console.log('::: Found ' + _.size(repoObjects.blob) + ' blobs');
  
  oidFiles = kdbFS.getRepositoryFileList(TREE_DIRECTORY, /\.json$/);
  oidFiles.forEach((oidFile) => {
    var oid = oidFile.replace(/\.json$/, '');
    var object = kdbFS.loadJSONDoc(TREE_DIRECTORY + '/' + oidFile);
    repoObjects.tree[oid] = object;
  });
  console.log('::: Found ' + _.size(repoObjects.tree) + ' trees');
  
  oidFiles = kdbFS.getRepositoryFileList(COMMIT_DIRECTORY, /\.json$/);
  oidFiles.forEach((oidFile) => {
    var oid = oidFile.replace(/\.json$/, '');
    var object = kdbFS.loadJSONDoc(COMMIT_DIRECTORY + '/' + oidFile);
    repoObjects.commit[oid] = object;
  });
  console.log('::: Found ' + _.size(repoObjects.commit) + ' commits');
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function addCachedObject(type, oid, object) {
  repoObjects[type][oid] = object;

  if(type === 'blob'){
    kdbFS.storeBinaryFile(OBJECT_DIRECTORY + '/' + type + path.sep + oid, object);
  } else {
    kdbFS.storeJSONDoc(OBJECT_DIRECTORY + '/' + type + path.sep + oid + '.json', object);    
  }
}

//////////////////////////////////////////////////////////////////////////
// Main Processing
//////////////////////////////////////////////////////////////////////////

// Load Cached Objects From Prior Runs
var beforeTime = Date.now();
loadCachedObjects(repoObjects);
var afterTime = Date.now();
var deltaTime = afterTime-beforeTime;
console.log('--- Load Cached Objects Time: ' + deltaTime/1000);


generateCommitHistoryIndices(repositoryPath, false).then(() => {
  console.log('::: Finished Indexing');
  addCachedObject();
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
  
  if (repoCommit[commit.id()]){
    console.log('::: Already indexed commit ' + commit.id());
    return indexCommit(repository, commits);      
  } else {
    console.log('::: Processing commit ' + commit.id());
    
    var beforeCommitTime = Date.now();

    return commit.getTree().then(function (tree) {
      var co = {
        treeId: tree.id().toString(),
        time: commit.timeMs(),
        author: commit.author().toString(),
        message: commit.message(),
        parents: []
      };
      for (var j = 0; j < commit.parentcount(); j++) {
        co.parents.push(commit.parentId(j).toString());
      }
      addCachedObject('commit', commit.id(), co);
      
      return parseTree(repository, tree);
    }).then(function (entryMap) {
      
      console.log('::: Loaded commit ' + commit.id());
      var afterCommitTime = Date.now();
      var deltaCommitTime = afterCommitTime-beforeCommitTime;
      console.log('--- Commit Read Time: ' + deltaCommitTime/1000);
      
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
  var entries = [];
  for (var j = 0; j < tree.entryCount(); j++) {
    var entry = tree.entryByIndex(j);
    
    var e = {
      type: (entry.isTree() ? 'tree' : 'blob'),
      oid: entry.sha(),
      name: entry.name()
    };
    entries.push(e);
    
    if (entry.isTree()) {
      // Retrieve subtree if it is not already cached
      if (!repoObjects.tree[entry.sha()]){
        promises.push(entry.getTree().then(function (t) {
          return parseTree(repository, t);
        }));
      }
    } else {
      // Retrieve Blob if it is not already cached
      var oid = entry.sha();
      if (!repoObjects.blob[oid]){
        promises.push(getContents(repository, oid));       
      }
    }
  }
  
  addCachedObject('tree', tree.id(), entries);
  
  return Promise.all(promises);
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function getContents(repository, oid) {
  return nodegit.Blob.lookup(repository, nodegit.Oid
    .fromString(oid)).then(function (blob) {
      addCachedObject('blob', oid, blob.content());
      return Promise.resolve(oid);
  }).catch(function (err) {
    console.log('*** Error retreiving: ' + oid);
    console.log(err.stack);
  });
}
