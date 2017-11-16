var nodegit = require('nodegit');
var path = require('path');
const fs = require('fs');
const ItemProxy = require('../common/models/item-proxy.js');
var kdbFS = require('../server/kdb-fs.js');
var _ = require('underscore');

const INDEX_DIRECTORY = path.join('kdb', 'index');
const OBJECT_DIRECTORY = 'kdb/cache/oid';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const repository = process.argv[2];

kdbFS.createDirIfMissing('kdb/cache');
kdbFS.createDirIfMissing('kdb/cache/oid');

var cachedOIDs = [];

var repoContents = {};

function loadCachedObjects(repoContents) {
  console.log('::: Loading cached objects');
  var oidFiles = kdbFS.getRepositoryFileList('kdb/cache/oid', /\.json$/);

  oidFiles.forEach((oidFile) => {
//    console.log('::: Loading ' + oidFile);
    var oid = oidFile.replace(/\.json$/, '');
    var object = kdbFS.loadJSONDoc('kdb/cache/oid/' + oidFile);
    repoContents[oid]=object;
  });
  
  cachedOIDs = Object.keys(repoContents).sort();
}

var beforeTime = Date.now();
loadCachedObjects(repoContents);
var afterTime = Date.now();
var deltaTime = afterTime-beforeTime;
console.log('--- Load Cached Objects Time: ' + deltaTime/1000);

var commitFileList = kdbFS.getRepositoryFileList(INDEX_DIRECTORY, /\.json$/);

var commitIndexed = {};

commitFileList.forEach((commitFile) => {
  var commitId = commitFile.replace(/\.json$/,'');
  commitIndexed[commitId] = true;
});

function storeCachedObjects() {
  var updatedOIDs = Object.keys(repoContents).sort();
  var newOIDs = _.difference(updatedOIDs, cachedOIDs);
  console.log('New Objects Found: ' + newOIDs.length);
  
  newOIDs.forEach((oid) => {
    kdbFS.storeJSONDoc('kdb/cache/oid/' + oid + '.json', repoContents[oid]);
  });  
  
  cachedOIDs = updatedOIDs;
}

generateCommitHistoryIndices(repository, false).then(() => {
  console.log('::: Finished Indexing');
  storeCachedObjects();
});

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
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
          if (repoContents[oid]){
            new ItemProxy(entryMap.objects[idKey].kind, repoContents[oid]);
          } else {
            promises.push(getContents(repository, entryMap.objects[idKey].oid).then(function (contents) {
              repoContents[oid] = contents;
              new ItemProxy(entryMap.objects[idKey].kind, repoContents[oid]);
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
