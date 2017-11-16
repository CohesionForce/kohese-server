var nodegit = require('nodegit');
var path = require('path');
const fs = require('fs');
const ItemProxy = require('../common/models/item-proxy.js');
var kdbFS = require('../server/kdb-fs.js');
var _ = require('underscore');

const INDEX_DIRECTORY = path.join('kdb', 'index');

const CACHE_DIRECTORY = path.join('kdb', 'cache');
const OBJECT_DIRECTORY = path.join(CACHE_DIRECTORY, 'git-object');
const COMMIT_DIRECTORY = path.join(OBJECT_DIRECTORY, 'commit');
const BLOB_DIRECTORY = path.join(OBJECT_DIRECTORY, 'blob');
const TREE_DIRECTORY = path.join(OBJECT_DIRECTORY, 'tree');

const repositoryPath = process.argv[2];

// TODO Remove or Replace Index Dir with Cache Dir
kdbFS.createDirIfMissing(INDEX_DIRECTORY);

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

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function loadCachedObjects(repoBlobs) {
  console.log('::: Loading cached objects');
  var oidFiles = kdbFS.getRepositoryFileList(BLOB_DIRECTORY, /\.json$/);

  oidFiles.forEach((oidFile) => {
    var oid = oidFile.replace(/\.json$/, '');
    var object = kdbFS.loadJSONDoc(BLOB_DIRECTORY + '/' + oidFile);
    repoObjects.blob[oid] = object;
  });
  
  oidFiles = kdbFS.getRepositoryFileList(TREE_DIRECTORY, /\.json$/);
  oidFiles.forEach((oidFile) => {
    var oid = oidFile.replace(/\.json$/, '');
    var object = kdbFS.loadJSONDoc(TREE_DIRECTORY + '/' + oidFile);
    repoObjects.tree[oid] = object;
  });
  
  oidFiles = kdbFS.getRepositoryFileList(COMMIT_DIRECTORY, /\.json$/);
  oidFiles.forEach((oidFile) => {
    var oid = oidFile.replace(/\.json$/, '');
    var object = kdbFS.loadJSONDoc(COMMIT_DIRECTORY + '/' + oidFile);
    repoObjects.commit[oid] = object;
  });
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function addCachedObject(type, oid, object) {
  repoObjects[type][oid] = object;
  kdbFS.storeJSONDoc(OBJECT_DIRECTORY + '/' + type + path.sep + oid + '.json', object);
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


// Determine what has already been indexed
var commitFileList = kdbFS.getRepositoryFileList(INDEX_DIRECTORY, /\.json$/);

var commitIndexed = {};

commitFileList.forEach((commitFile) => {
  var commitId = commitFile.replace(/\.json$/,'');
  commitIndexed[commitId] = true;
});

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
        if (!fs.existsSync(INDEX_DIRECTORY)) {
          fs.mkdirSync(INDEX_DIRECTORY);
        }
        
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
  
  if (commitIndexed[commit.id()]){
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
      addCachedObject("commit", commit.id(), co);
      
      return getIndexEntries(tree, []);
    }).then(function (entryMap) {
      var beforeTime = Date.now();
      ItemProxy.resetItemRepository();
      var afterTime = Date.now();
      var deltaTime = afterTime-beforeTime;
      console.log('--- Reset Time: ' + deltaTime/1000);
      
      var promises = [];
      for (var j = 0; j < entryMap.length; j++) {
        (function (jIndex) {
          var oid = entryMap[j].oid;
          if (!repoObjects.blob[oid]){
            promises.push(getContents(repository, entryMap[j].oid).then(function (contents) {
              addCachedObject("blob", oid, contents);
            }));          
          }
        })(j);
      }
      
      return Promise.all(promises).then(function () {
        console.log('::: Loaded commit ' + commit.id());
        var afterCommitTime = Date.now();
        var deltaCommitTime = afterCommitTime-beforeCommitTime;
        console.log('--- Commit Read Time: ' + deltaCommitTime/1000);
        
        return indexCommit(repository, commits);
      });      
    }).catch(function (err) {
      console.log(err.stack);
    });
  }  
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function getIndexEntries(tree, paths) {
  var p;
  if (paths.length > 0) {
    var entryPromises = [];
    for (var j = 0; j < paths.length; j++) {
      (function (jIndex) {
        var p = paths[jIndex];
        entryPromises.push(tree.entryByPath(p).then(function (entry) {
          if (entry) {
            return {
              uuid: p.substring(p.lastIndexOf(path.sep) + 1,
                  p.lastIndexOf('.json')),
              oid: entry.sha(),
              kind: path.basename(path.dirname(p))
            };
          }
        }));
      })(j);
    }
    
    p = Promise.all(entryPromises);
  } else {
    p = parseTree(tree);
  }
  
  return p;
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function parseTree(tree) {
  var promises = [];
  var entries = [];
  for (var j = 0; j < tree.entryCount(); j++) {
    var entry = tree.entryByIndex(j);
    
    var e = {
      type: (entry.isTree() ? "tree" : "blob"),
      oid: entry.sha(),
      name: entry.name()
    };
    entries.push(e);
    
    if (entry.isTree()) {
      promises.push(entry.getTree().then(function (t) {
        return parseTree(t);
      }));
    } else {
      promises.push(Promise.resolve({
        oid: entry.sha(),
        name: entry.name()
      }));
    }
  }
  
  addCachedObject("tree", tree.id(), entries);
  
  return Promise.all(promises).then(function (results) {
    var objects = [];
    for (var j = 0; j < results.length; j++) {
      if (Array.isArray(results[j])) {
        for (var k = 0; k < results[j].length; k++) {
          objects.push(results[j][k]);
        }
      } else {
        objects.push(results[j]);
      }
    }
    
    return Promise.resolve(objects);
  });
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function getContents(repository, oid) {
  return nodegit.Blob.lookup(repository, nodegit.Oid
    .fromString(oid)).then(function (o) {
    return JSON.parse(o.toString());
  }).catch(function (err) {
    console.log(err.stack);
  });
}
