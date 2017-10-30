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
function openRepo(proxy) {
  var path = proxy.getRepositoryProxy().repoPath.split('Root.json')[0];
    console.log("::: Opening git repo " + path);
    return nodegit.Repository.open(path).then(function (r) {
      repoList[proxy.item.id] = r;
    }).catch(function (err) {
      console.log("Error opening repository at " + path + ". " + err);
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
function generateCommitHistoryIndices(proxy, overwrite) {
  var p = proxy.getRepositoryProxy().repoPath.split('Root.json')[0];
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
function getContents(repositoryProxy, oid) {
  return nodegit.Blob.lookup(repoList[repositoryProxy.item.id], nodegit.Oid
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
function initializeRepository(repoProxy, path) {
  return nodegit.Repository.init(path, 0).then(function (r) {
    repoList[repoProxy.item.id] = r;
  });
}
module.exports.initializeRepository = initializeRepository;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function add(proxies) {
  var addStatusMap = {};
  var repoIndexMap = {};
  var promises = [];
  for (var i = 0; i < proxies.length; i++) {
    (function (iIndex) {
      var info = repoRelativePathOf(proxies[iIndex]);
      promises.push(info.gitRepo.refreshIndex().then(function(index) {
         return index.addByPath(info.relativeFilePath).then(function(result) {
           repoIndexMap[info.gitRepo] = index;
           var added = false;
           var indexEntries = index.entries();
           for (var j = 0; j < indexEntries.length; j++) {
             if (indexEntries[j].path === info.relativeFilePath) {
               added = true;
               break;
             }
           }
           
           addStatusMap[proxies[iIndex].item.id] = added;
         });
      }));
    })(i);
  }
  
  return Promise.all(promises).then(function () {
    var promises = [];
    for (var repo in repoIndexMap) {
      promises.push(repoIndexMap[repo].write());
    }
    
    return Promise.all(promises);
  }).then(function () {
    return addStatusMap;
  });
}
module.exports.add = add;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function commit(proxies, userName, eMail, message) {
  // TODO Does "HEAD" need to be a variable?
  var commitIdMap = {};
  var signature = nodegit.Signature.now(userName, eMail);
  var promises = [];
  for (var i = 0; i < proxies.length; i++) {
    var info = repoRelativePathOf(proxies[i]);
    var repo = info.gitRepo;
    (function (iIndex) {
      promises.push(repo.getHeadCommit().then(function (commit) {
        return repo.refreshIndex().then(function (index) {
          return index.writeTree();
        }).then(function (treeId) {
          return repo.createCommit("HEAD", signature, signature, message,
              treeId, [commit]).then(function (commitId) {
            commitIdMap[proxies[iIndex].item.id] = commitId;
            return repo.getCommit(commitId).then(function (c) {
              return indexCommit(c);
            });
          });
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
function push(proxies, remoteName, defaultUser) {
  var pushStatusMap = {};
  var promises = [];
  for (var i = 0; i < proxies.length; i++) {
    var info = repoRelativePathOf(proxies[i]);
    (function (iIndex) {
      promises.push(info.gitRepo.getRemote(remoteName).then(function(remote) {
        // TODO Does the refs String below need to change?
           return remote.push(["refs/heads/master:refs/heads/master"],
              {
                 callbacks: {
                    credentials: function(url, u) {
                      // TODO Get the username from the given URL once we have
                      // upgraded our version of node.js
                      return nodegit.Cred.sshKeyFromAgent(defaultUser);
                    }
                 }
              }).then(function (status) {
                pushStatusMap[proxies[iIndex].item.id] = status;
              })
                .catch(function(err){
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
function checkout(proxies, force) {
  var repoMap = [];
  for (var i = 0; i < proxies.length; i++) {
    var add = true;
    var info = repoRelativePathOf(proxies[i]);
    for (var j = 0; j < repoMap.length; j++) {
      if (repoMap[j].repo === info.gitRepo) {
        repoMap[j].paths.push(info.relativeFilePath);
        add = false;
        break;
      }
    }
    
    if (add) {
      repoMap.push({
        repo: info.gitRepo,
        paths: [info.relativeFilePath]
      });
    }
  }
  
  var promises = [];
  for (var j = 0; j < repoMap.length; j++) {
    var options = new nodegit.CheckoutOptions();
    options.paths = repoMap[j].paths;
    options.checkoutStrategy = (force ? (nodegit.Checkout.STRATEGY.FORCE
        | nodegit.Checkout.STRATEGY.REMOVE_UNTRACKED) : (nodegit.Checkout.STRATEGY.SAFE
        | nodegit.Checkout.STRATEGY.ALLOW_CONFLICTS));
    //options.notifyFlags = nodegit.Checkout.NOTIFY.ALL;
    //options.notifyCb = function (why, path, baseline, target, workdir, payload) {
      // Return zero to proceed
    //  return 0;
    //};
    // Passing null uses HEAD for the checkout
    promises.push(nodegit.Checkout.tree(repoMap[j].repo, null, options));
  }
  
  return Promise.all(promises);
}
module.exports.checkout = checkout;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function reset(proxiesToReset) {
  var promises = [];
  var repoMap = [];
  for (var j = 0; j < proxiesToReset.length; j++) {
    var info = repoRelativePathOf(proxiesToReset[j]);
    var found = false;
    for (var k = 0; k < repoMap.length; k++) {
      if (repoMap[k].repo === info.gitRepo) {
        found = true;
        repoMap[k].resetPaths.push(info.relativeFilePath);
        break;
      }
    }
    
    if (!found) {
      repoMap.push({
          repo: info.gitRepo,
          resetPaths: [info.relativeFilePath]
      });
    }
  }
  
  for (var i = 0; i < repoMap.length; i++) {
    (function (iIndex) {
      promises.push(repoMap[iIndex].repo.getHeadCommit().then(function (commit) {
        return nodegit.Reset.default(repoMap[iIndex].repo, commit, repoMap[iIndex].resetPaths);
      }));
    })(i);
  }
  
  return Promise.all(promises);
}
module.exports.reset = reset;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function diff(proxy) {
  var info = repoRelativePathOf(proxy);
  return info.gitRepo.getHeadCommit().then(function (commit) {
    return commit.getTree().then(function (tree) {
       return nodegit.Diff.treeToWorkdirWithIndex(info.gitRepo, tree, null);
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
function addRemote(proxy, remoteName, remoteUrl) {
  var info = repoRelativePathOf(proxy);
  return nodegit.Remote.create(info.gitRepo, remoteName, remoteUrl)
    .then(function (remote) {
      return remote.name();
  });
}
module.exports.addRemote = addRemote;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function getRemotes(proxy) {
  var info = repoRelativePathOf(proxy);
  return nodegit.Remote.list(info.gitRepo);
}
module.exports.getRemotes = getRemotes;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function fetch(proxy, remoteName) {
  var info = repoRelativePathOf(proxy);
  return info.gitRepo.fetch(remoteName, {
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
function merge(proxy, signature) {
  var info = repoRelativePathOf(proxy);
  return Promise.join(info.gitRepo.getHeadCommit(), info.gitRepo.getMasterCommit(), function (hc, mc) {
    var index = nodegit.Merge.commits(info.gitRepo, hc, mc, null);
    if (index.hasConflicts()) {
      // TODO Handle conflicts
    }
    
    return index.writeTreeTo(info.gitRepo).then(function (treeId) {
      return info.gitRepo.createCommit("HEAD", signature, signature, "Merge from master to HEAD.", treeId, [hc, mc]);
    });
  });
}
module.exports.merge = merge;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function pull(proxy, remoteName, signature) {
  var info = repoRelativePathOf(proxy);
  return fetch(info.gitRepo, remoteName).then(function () {
    return merge(info.gitRepo, signature);
  });
}
module.exports.pull = pull;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function repoRelativePathOf(proxy){
  var filePath = proxy.repoPath;
  var repoProxy = proxy.getRepositoryProxy();
  var r = repoList[repoProxy.item.id];

  while(!r) {
      if(!repoProxy.parentProxy){
          console.log('!!! Cannot find a git repo containing ' + filePath);
          return;
      }
      
      repoProxy = repoProxy.parentProxy.getRepositoryProxy();
      r = repoList[repoProxy.item.id];
  }
  
  var pathToRepo = repoProxy.repoPath.split('Root.json')[0];
  var relativeFilePath = filePath.split(pathToRepo)[1];

  return {
    repoProxy: repoProxy,
    gitRepo: r,
    pathToRepo: pathToRepo,
    relativeFilePath: relativeFilePath
  };
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function getStatus (proxy, callback){
  //This code gets working directory changes similar to git status
  var info = repoRelativePathOf(proxy);
  info.gitRepo.getStatusExt().then(function(statuses) {
    
    var repoStatus = [];
    
    statuses.forEach(function(file) {
      var fileString = file.path();
      var fileParts = fileString.match(itemFileRegEx);

      if (fileParts) {
        var itemId = fileParts[1];
        repoStatus.push({
          id: itemId,
          status: file.status()
        });
      }

    });

    callback(repoStatus);
  });
}
module.exports.getStatus = getStatus;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function getItemStatus(proxy) {
  var info = repoRelativePathOf(proxy);
  var status = [];
  var statNum = nodegit.Status.file(info.gitRepo, info.relativeFilePath);
  
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
function walkHistoryForFile(proxy, callback){
  var repoInfo = repoRelativePathOf(proxy);
  var itemId = repoInfo.relativeFilePath.substring(repoInfo.relativeFilePath.lastIndexOf(path.sep) + 1,
      repoInfo.relativeFilePath.lastIndexOf(".json"));
  if (!UUID_REGEX.test(itemId)) {
    // The ID was not a valid UUID, so assume that the Item is a Repository.
    // TODO Fix this case. All (or almost all) commits are being displayed.
    itemId = path.basename(path.dirname(repoInfo.relativeFilePath));
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
