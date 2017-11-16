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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const repositoryPath = process.argv[2];

// TODO Remove or Replace Index Dir with Cache Dir
kdbFS.createDirIfMissing(INDEX_DIRECTORY);

kdbFS.createDirIfMissing(CACHE_DIRECTORY);
kdbFS.createDirIfMissing(OBJECT_DIRECTORY);
kdbFS.createDirIfMissing(COMMIT_DIRECTORY);
kdbFS.createDirIfMissing(BLOB_DIRECTORY);
kdbFS.createDirIfMissing(TREE_DIRECTORY);

var cachedOIDs = [];
var repoBlobs = {};

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function loadCachedObjects(repoBlobs) {
  console.log('::: Loading cached objects');
  var oidFiles = kdbFS.getRepositoryFileList(BLOB_DIRECTORY, /\.json$/);

  oidFiles.forEach((oidFile) => {
    var oid = oidFile.replace(/\.json$/, '');
    var object = kdbFS.loadJSONDoc(BLOB_DIRECTORY + '/' + oidFile);
    repoBlobs[oid]=object;
  });
  
  cachedOIDs = Object.keys(repoBlobs).sort();
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function storeCachedObjects() {
  var updatedOIDs = Object.keys(repoBlobs).sort();
  var newOIDs = _.difference(updatedOIDs, cachedOIDs);
  console.log('New Objects Found: ' + newOIDs.length);
  
  newOIDs.forEach((oid) => {
    kdbFS.storeJSONDoc(BLOB_DIRECTORY + '/' + oid + '.json', repoBlobs[oid]);
  });  
  
  cachedOIDs = updatedOIDs;
}

//////////////////////////////////////////////////////////////////////////
// Main Processing
//////////////////////////////////////////////////////////////////////////

// Load Cached Objects From Prior Runs
var beforeTime = Date.now();
loadCachedObjects(repoBlobs);
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
  storeCachedObjects();
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

    return commit.getTree().then(function (tree) {
      return getIndexEntries(tree, []);
    }).then(function (entryMap) {
      entryMap.meta.time = commit.timeMs();
      entryMap.meta.author = commit.author().toString();
      entryMap.meta.message = commit.message();
      entryMap.meta.parents = [];
      for (var j = 0; j < commit.parentcount(); j++) {
        entryMap.meta.parents.push(commit.parentId(j).toString());
      }

      ItemProxy.resetItemRepository();
      
      var promises = [];
      for (var id in entryMap.objects) {
        (function (idKey) {
          var oid = entryMap.objects[idKey].oid;
          if (repoBlobs[oid]){
            new ItemProxy(entryMap.objects[idKey].kind, repoBlobs[oid]);
          } else {
            promises.push(getContents(repository, entryMap.objects[idKey].oid).then(function (contents) {
              repoBlobs[oid] = contents;
              new ItemProxy(entryMap.objects[idKey].kind, repoBlobs[oid]);
            }));          
          }
        })(id);
      }
      
      return Promise.all(promises).then(function () {
        console.log('::: Loaded commit ' + commit.id());
        ItemProxy.loadingComplete();
        entryMap.treeHash = ItemProxy.getAllTreeHashes();

        fs.writeFileSync(path.join(INDEX_DIRECTORY, commit.id() + '.json'),
            JSON.stringify(entryMap, null, '  '), {encoding: 'utf8', flag: 'w'});

        storeCachedObjects();
        
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
  
  return p.then(function (entries) {
    var entryMap = {
      meta: {},
      objects: {}
    };
    
    entries.sort(function (e1, e2) {
      return (e1.uuid > e2.uuid ? 1 : (e1.uuid < e2.uuid ? -1 : 0));
    });
    
    for (var j = 0; j < entries.length; j++) {
      entryMap.objects[entries[j].uuid] = {
          oid: entries[j].oid,
          kind: entries[j].kind
        };
    }
    
    return entryMap;
  });
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function parseTree(tree) {
  var promises = [];
  for (var j = 0; j < tree.entryCount(); j++) {
    var entry = tree.entryByIndex(j);
    if (entry.isTree()) {
      promises.push(entry.getTree().then(function (t) {
        return parseTree(t);
      }));
    } else {
      var p = entry.path();
      var k = path.basename(path.dirname(p));
      if ('Analysis' !== k) {
        var id = path.basename(p, '.json');
        if (UUID_REGEX.test(id)) {
          promises.push(Promise.resolve({
            uuid: id,
            oid: entry.sha(),
            kind: k
          }));
        }
      }
    }
  }
  
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
