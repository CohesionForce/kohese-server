/**
 * Knowledge Database Repo Management
 */


var nodegit = require('nodegit');
var path = require("path");
const fs = require("fs");

var itemFileRegEx = /^.*\/([0-9a-f\-]*(\/Root)?)\.json$/;
var repoFileSplitRegEx = /^(kdb\/kohese-kdb)\/(.*)$/;
var repoList = {};
var stageMap = {};
const INDEX_DIRECTORY = path.join("kdb", "index");
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function openRepo(repositoryId, repositoryPath) {
  console.log("::: Opening git repo " + repositoryPath);
  return nodegit.Repository.open(repositoryPath).then(function (r) {
    repoList[repositoryId] = r;
  }).catch(function (err) {
    console.log("Error opening repository at " + repositoryPath + ". " + err);
  });
}
module.exports.openRepo = openRepo;

function getCommitFilesChanged(commit) {
  return commit.getDiff().then(function (diffs) {
    var diffOpts = {
        flags: nodegit.Diff.FIND.RENAMES
    };
    var diffPromise = [];
    var paths = [];
    for (var j = 0; j < diffs.length; j++) {
      (function (jIndex) {
        diffPromise.push(diffs[jIndex].findSimilar(diffOpts).then(function (result) {
          for (var k = 0; k < diffs[jIndex].numDeltas(); k++) {
            var p = diffs[jIndex].getDelta(k).newFile().path();
            if (-1 === paths.indexOf(p)) {
              paths.push(p);
            }
          }
        }));
      })(j);
    }
    
    return Promise.all(diffPromise).then(function () {
      return paths;
    });
  });
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function generateCommitHistoryIndices(repositoryPath, overwrite) {
  return nodegit.Repository.open(repositoryPath).then(function (r) {
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
        
        var promises = [];
        for (var j = 0; j < commits.length; j++) {
          if (overwrite || !fs.existsSync(path.join(INDEX_DIRECTORY,
              commits[j].id() + ".json"))) {
            promises.push(indexCommit(commits[j]));
          }
        }
        
        return Promise.all(promises);
      });
    });
  });
}
module.exports.generateCommitHistoryIndices = generateCommitHistoryIndices;

function indexCommit(commit) {
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
    
    fs.writeFileSync(path.join(INDEX_DIRECTORY, commit.id() + ".json"),
      JSON.stringify(entryMap, null, "  "), {encoding: 'utf8', flag: 'w'});
    return Promise.resolve(true);
  }).catch(function (err) {
    console.log(err.stack);
  });
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
                  p.lastIndexOf(".json")),
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
      var id = p.substring(p.lastIndexOf(path.sep) + 1, p.lastIndexOf(".json"));
      if (UUID_REGEX.test(id)) {
        promises.push(Promise.resolve({
          uuid: id,
          oid: entry.sha(),
          kind: path.basename(path.dirname(p))
        }));
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
function getContents(repositoryId, oid) {
  return nodegit.Blob.lookup(repoList[repositoryId], nodegit.Oid
    .fromString(oid)).then(function (o) {
    return JSON.parse(o.toString());
  }).catch(function (err) {
    console.log(err.stack);
  });
}
module.exports.getContents = getContents;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function initializeRepository(repositoryId, path) {
  return nodegit.Repository.init(path, 0).then(function (r) {
    repoList[repositoryId] = r;
  });
}
module.exports.initializeRepository = initializeRepository;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function add(repositoryId, filePath) {
  return repoList[repositoryId].refreshIndex().then(function (index) {
    return index.addByPath(filePath).then(function () {
      return index.write();
    }).then(function () {
      var status = getItemStatus(repositoryId, filePath);
      for (var j = 0; j < status.length; j++) {
        if (status[j].startsWith("INDEX_")) {
          return true;
        }
      }
      
      return false;
    });
  });
}
module.exports.add = add;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function commit(repositoryIds, userName, eMail, message) {
  // TODO Does "HEAD" need to be a variable?
  var commitIdMap = {};
  var signature = nodegit.Signature.now(userName, eMail);
  var promises = [];
  for (var i = 0; i < repositoryIds.length; i++) {
    var repo = repoList[repositoryIds[i]];
    (function (iIndex) {
      promises.push(repo.getHeadCommit().then(function (commit) {
        return repo.refreshIndex().then(function (index) {
          return index.writeTree().then(function (treeId) {
            var parentCommits = [];
            if (commit) {
              parentCommits.push(commit);
            }
            return repo.getStatusExt().then(function (statuses) {
              var filePaths = [];
              for (var j = 0; j < statuses.length; j++) {
                var status = statuses[j];
                if (status.inIndex()) {
                  filePaths.push(status.path());
                }
              }
              
              return repo.createCommit("HEAD", signature, signature, message,
                  treeId, parentCommits).then(function (commitId) {
                commitIdMap[repositoryIds[iIndex]] = {
                  commitId: commitId,
                  filesCommitted: filePaths
                };
                return repo.getCommit(commitId).then(function (c) {
                  return indexCommit(c);
                });
              });
            });
          });
        }).catch(function (err) {
          console.log(err.stack);
        });
      }));
    })(i);
  }
  
  return Promise.all(promises).then(function () {
    return commitIdMap;
  });
}
module.exports.commit = commit;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function push(repositoryIds, remoteName, defaultUser) {
  var pushStatusMap = {};
  var promises = [];
  for (var i = 0; i < repositoryIds.length; i++) {
    (function (iIndex) {
      promises.push(repoList[repositoryIds[iIndex]].getRemote(remoteName).then(function(remote) {
        // TODO Does the refs String below need to change?
        return remote.push(["refs/heads/master:refs/heads/master"], {
            callbacks: {
              credentials: function(url, u) {
                // TODO Get the username from the given URL once we have
                // upgraded our version of node.js
                return nodegit.Cred.sshKeyFromAgent(defaultUser);
              }
            }
        }).then(function (status) {
          pushStatusMap[repositoryIds[iIndex]] = status;
        }).catch(function(err){
          console.log(err); 
        });
      }));
    })(i);
  }
  
  return Promise.all(promises).then(function () {
    return pushStatusMap;
  });
}
module.exports.push = push;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function checkout(repositoryId, filePaths, force) {
  var repository = repoList[repositoryId];
  var checkoutPaths = [];
  var checkoutPathsFromTree = [];
  var checkoutPathsFromIndex = [];
  for (var j = 0; j < filePaths.length; j++) {
    var status = getItemStatus(repositoryId, filePaths[j]);
    var inIndex = false;
    for (var k = 0; k < status.length; k++) {
      if (status[k].startsWith("INDEX_")) {
        inIndex = true;
        break;
      }
    }

    // TODO Need to simplify the logic associated with tree/index detection
    if (!inIndex) {
      checkoutPathsFromTree.push(filePaths[j]);
    } else {
      checkoutPathsFromIndex.push(filePaths[j]);
    }
    checkoutPaths.push(filePaths[j]);
  }

  if (checkoutPaths.length > 0) {
    var options = new nodegit.CheckoutOptions();
    options.paths = checkoutPaths;
    options.checkoutStrategy = (force ? (nodegit.Checkout.STRATEGY.FORCE
        | nodegit.Checkout.STRATEGY.REMOVE_UNTRACKED) : (nodegit.Checkout.STRATEGY.SAFE
        | nodegit.Checkout.STRATEGY.ALLOW_CONFLICTS));
    //options.notifyFlags = nodegit.Checkout.NOTIFY.ALL;
    //options.notifyCb = function (why, path, baseline, target, workdir, payload) {
    //  // Return zero to proceed
    //  return 0;
    //};
    // Passing null uses HEAD for the checkout

    // TODO Need to simplify the logic associated with tree/index processing
    // TODO Need to handle case when there are changes in both tree and index
    var checkoutResult = new Promise(function(resolve, reject){

      if (checkoutPathsFromIndex.length === 0){
        // Checkout from tree
        nodegit.Checkout.tree(repository, null, options)
        .then(function() {
          resolve(true);
        });      
      } else {
        // Checkout from index
        repository.refreshIndex()
        .then(function(index){
          nodegit.Checkout.index(repository, index, options)
          .then(function() {
            resolve(true);
          });          
        })
        .catch((error) => {
          reject(error);
        });
      }
    });
    
    return checkoutResult;
  } else {
    return Promise.resolve(true);
  }
}
module.exports.checkout = checkout;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function reset(repositoryId, filePaths) {
  var repository = repoList[repositoryId];
  return repository.getHeadCommit().then(function (commit) {
    return nodegit.Reset.default(repository, commit, filePaths);
  });
}
module.exports.reset = reset;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function diff(repositoryId) {
  var repository = repoList[repositoryId];
  return repository.getHeadCommit().then(function (commit) {
    return commit.getTree().then(function (tree) {
       return nodegit.Diff.treeToWorkdirWithIndex(repository, tree, null);
    });
  }).then(function (diff) {
    var diffContent = [];
    return diff.patches().then(function (patches) {
      var pPatch = [];
      patches.forEach(function (p) {
        pPatch.push(p.hunks().then(function (hunks) {
          var pHunks = [];
          hunks.forEach(function (h) {
            pHunks.push(h.lines().then(function (lines) {
              diffContent.push("diff " + p.oldFile().path() + " " + p.newFile().path());
              diffContent.push(h.header().trim());
              lines.forEach(function (l) {
                diffContent.push(String.fromCharCode(l.origin()) + l.content().trim());
              });
            }));
          });

          return Promise.all(pHunks);
        }));
      });

      return Promise.all(pPatch);
    }).then(function () {
       return diffContent;
    });
  });
}
module.exports.diff = diff;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function addRemote(repositoryId, remoteName, remoteUrl) {
  return nodegit.Remote.create(repoList[repositoryId], remoteName, remoteUrl)
    .then(function (remote) {
      return remote.name();
  });
}
module.exports.addRemote = addRemote;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function getRemotes(repositoryId) {
  return nodegit.Remote.list(repoList[repositoryId]);
}
module.exports.getRemotes = getRemotes;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function fetch(repositoryId, remoteName) {
  return repoList[repositoryId].fetch(remoteName, {
    callbacks: {
      credentials: function (url, username) {
        return nodegit.Cred.sshKeyFromAgent(username);
      }
    }
  });
}
module.exports.fetch = fetch;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function merge(repositoryId, signature) {
  var repository = repoList[repositoryId];
  return Promise.join(repository.getHeadCommit(), repository.getMasterCommit(), function (hc, mc) {
    var index = nodegit.Merge.commits(repository, hc, mc, null);
    if (index.hasConflicts()) {
      // TODO Handle conflicts
    }
    
    return index.writeTreeTo(repository).then(function (treeId) {
      return repository.createCommit("HEAD", signature, signature, "Merge from master to HEAD.", treeId, [hc, mc]);
    });
  });
}
module.exports.merge = merge;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function pull(repositoryId, remoteName, signature) {
  var repository = repoList[repositoryId];
  return fetch(repository, remoteName).then(function () {
    return merge(repository, signature);
  });
}
module.exports.pull = pull;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function getStatus (repositoryId, callback){
  //This code gets working directory changes similar to git status
  repoList[repositoryId].getStatusExt().then(function(statuses) {
    
    var repoStatus = [];
    
    statuses.forEach(function(file) {
      var fileString = file.path();
      if (fileString.endsWith('.json')) {
        var id = path.basename(fileString, '.json');
        var foundId = true;
        if (!UUID_REGEX.test(id)) {
          id = path.basename(path.dirname(fileString));
          if (!UUID_REGEX.test(id)) {
            foundId = false;
          }
        }
        
        if (foundId) {
          repoStatus.push({
            id: id,
            status: file.status()
          });
        }
      }
    });

    callback(repoStatus);
  });
}
module.exports.getStatus = getStatus;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function getItemStatus(repositoryId, filePath) {
  var status = [];
  var statNum = nodegit.Status.file(repoList[repositoryId], filePath);
  
  for (var statusKey in nodegit.Status.STATUS) {
    if ((statNum & nodegit.Status.STATUS[statusKey]) !== 0) {
      status.push(statusKey);
    }
  }
  
  return status;
}
module.exports.getItemStatus = getItemStatus;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function walkHistoryForFile(filePath, callback){
  var itemId = filePath.substring(filePath.lastIndexOf(path.sep) + 1,
      filePath.lastIndexOf(".json"));
  if (!UUID_REGEX.test(itemId)) {
    // The ID was not a valid UUID, so assume that the Item is a Repository.
    // TODO Fix this case. All (or almost all) commits are being displayed.
    itemId = path.basename(path.dirname(filePath));
  }
  var commitFiles = fs.readdirSync(INDEX_DIRECTORY);
  var relatedCommits = [];
  for (var j = 0; j < commitFiles.length; j++) {
    var content = JSON.parse(fs.readFileSync(path.join(INDEX_DIRECTORY, commitFiles[j])));
    var entry = content.objects[itemId];
    if (entry) {
      relatedCommits.push({
        commit: commitFiles[j].substring(0, commitFiles[j].lastIndexOf(".json")),
        message: content.meta.message,
        author: content.meta.author,
        date: content.meta.time,
        indexEntry: entry
      });
    }
  }
  
  relatedCommits.sort(function (c1, c2) {
    return c2.date - c1.date;
  });
  
  var j = relatedCommits.length - 1;
  var lastEntry = relatedCommits[j].indexEntry;
  while (j--) {
    var entry = relatedCommits[j].indexEntry;
    if ((entry.oid === lastEntry.oid) && (entry.kind === lastEntry.kind)) {
      relatedCommits.splice(j, 1);
    } else {
      lastEntry = entry;
    }
  }
  
  var historyResponse = {
      id: itemId,
      history: relatedCommits
  };
  
  callback(historyResponse);
}
module.exports.walkHistoryForFile = walkHistoryForFile;
