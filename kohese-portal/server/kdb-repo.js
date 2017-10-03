/**
 * Knowledge Database Repo Management
 */


var nodegit = require('nodegit');
var path = require("path");

var itemFileRegEx = /^.*\/([0-9a-f\-]*(\/Root)?)\.json$/;
var repoFileSplitRegEx = /^(kdb\/kohese-kdb)\/(.*)$/;
var repoList = {};
var stageMap = [];

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function openRepo(proxy) {
  var path = proxy.getRepositoryProxy().repoPath.split('Root.json')[0];
    console.log("::: Opening git repo " + path);
    return nodegit.Repository.open(path).then(function (r) {
      return r.getMasterCommit().then(function (mc) {
        var rw = nodegit.Revwalk.create(r);
        rw.sorting(nodegit.Revwalk.SORT.TIME);
        rw.push(mc.id());
        return rw.getCommitsUntil(function (c) {
          return true;
        }).then(function (commits) {
          var commitPromise = [];
          var changes = [];
          for (var i = 0; i < commits.length; i++) {
            (function (iIndex) {
              commitPromise.push(commits[i].getDiff().then(function (diffs) {
                var diffOpts = {
                    flags: nodegit.Diff.FIND.RENAMES
                };
                var diffPromise = [];
                var f = [];
                for (var j = 0; j < diffs.length; j++) {
                  (function (jIndex, files) {
                    diffPromise.push(diffs[jIndex].findSimilar(diffOpts).then(function (result) {
                      var fileStructure = {
                          names: [],
                          paths: [],
                          statuses: []
                      };
                      
                      for (var k = 0; k < diffs[jIndex].numDeltas(); k++) {
                        var d = diffs[jIndex].getDelta(k);
                        var np = d.newFile().path();
                        var op = d.oldFile().path();
                        var stat = d.status();
                        
                        if (-1 == fileStructure.paths.indexOf(np)) {
                          fileStructure.paths.push(np);
                          /* Get the UUID of the file, as that should be mostly
                          unchanging */
                          fileStructure.names.push(np.substring(np.lastIndexOf("/") + 1, np.lastIndexOf(".json")));
                        }
                        
                        if (-1 == fileStructure.paths.indexOf(op)) {
                          fileStructure.paths.push(op);
                        }
                        
                        if (-1 == fileStructure.statuses.indexOf(stat)) {
                          fileStructure.statuses.push(stat);
                        }
                      }
                      
                      files.push(fileStructure);
                    }));
                  })(j, f);
                }
                
                return Promise.all(diffPromise).then(function () {
                  changes.push({
                    commit: commits[iIndex],
                    files: f
                  });
                });
              }));
            })(i);
          }
          
          return Promise.all(commitPromise).then(function () {
            repoList[proxy.item.id] = {
                repo: r,
                history : changes
            };
          });
        });
      });
    }).catch(function (err) {
      console.log("Error opening repository at " + path + ". " + err);
    });
}
module.exports.openRepo = openRepo;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function initializeRepository(repoProxy, path) {
	return nodegit.Repository.init(path, 0).then(function (r) {
	  repoList[repoProxy.item.id] = {
	      repo: r,
	      history: []
	  };
	});
}
module.exports.initializeRepository = initializeRepository;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function add(proxies) {
  var promises = [];
  for (var i = 0; i < proxies.length; i++) {
    var info = repoRelativePathOf(proxies[i]);
    promises.push(info.gitRepo.refreshIndex().then(function(index) {
       return index.addByPath(info.relativeFilePath).then(function(result) {
          index.write();
          return result;
       }).then(function(result) {
          stageMap[info.gitRepo] = index.writeTree();
          return result;
       });
    }));
  }
  
  return Promise.all(promises);
}
module.exports.add = add;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function commit(proxies, userName, eMail, message) {
  // TODO Does "HEAD" need to be a variable?
  var signature = nodegit.Signature.now(userName, eMail);
  var promises = [];
  for (var i = 0; i < proxies.length; i++) {
    var info = repoRelativePathOf(proxies[i]);
    var repo = info.gitRepo;
    promises.push(repo.getHeadCommit().then(function (commit) {
      if (stageMap[repo]) {  
        repo.createCommit("HEAD", signature, signature, message, stageMap[repo], [commit]);
        delete stageMap[repo];
      }
    }));
  }
  
  return Promise.all(promises);
}
module.exports.commit = commit;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function push(proxies, remoteName) {
  var promises = [];
  for (var i = 0; i < proxies.length; i++) {
    var info = repoRelativePathOf(proxies[i]);
    promises.push(info.gitRepo.getRemote(remoteName).then(function(remote) {
      // TODO Does the refs String below need to change?
         return remote.push(["refs/heads/master:refs/heads/master"],
            {
               callbacks: {
                  credentials: function(url, username) {
                     return nodegit.Cred.sshKeyFromAgent(username);
                  }
               }
            });
         }));
  }
  
  return Promise.all(promises);
}
module.exports.push = push;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function checkout(proxies, pointOfReference, force) {
  var repoMap = [];
  for (var i = 0; i < proxies.length; i++) {
    var add = true;
    var info = repoRelativePathOf(proxies[i]);
    for (var j = 0; j < repoMap.length; j++) {
      if (repoMap[j].repo == info.gitRepo) {
        repoMap[j].paths.push(info.relativeFilePath);
        add = false;
        break;
      }
    }
    
    if (add) {
      var p = [];
      p.push(info.relativeFilePath);
      repoMap.push({
        repo: info.gitRepo,
        paths: p
      });
    }
  }
  
  var promises = [];
  for (var j = 0; j < repoMap.length; j++) {
    var options = new nodegit.CheckoutOptions();
    options.paths = repoMap[j].paths;
    options.checkoutStrategy = (force ? nodegit.Checkout.STRATEGY.FORCE : nodegit.Checkout.STRATEGY.SAFE);
    promises.push(nodegit.Checkout.tree(repoMap[j].repo, pointOfReference, options));
  }
  
  return Promise.all(promises);
}
module.exports.checkout = checkout;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function reset(proxies, paths) {
  var promises = [];
  for (var i = 0; i < proxies.length; i++) {
    var info = repoRelativePathOf(proxies[i]);
    promises.push(info.gitRepo.getHeadCommit().then(function (commit) {
      return nodegit.Reset.default(info.gitRepo, commit, paths);
    }));
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
  return nodegit.Remote.create(info.gitRepo, remoteName, remoteUrl);
}
module.exports.addRemote = addRemote;

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
    gitRepo: r.repo,
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
		if ((statNum & nodegit.Status.STATUS[statusKey]) != 0) {
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
  var relatedCommits = collectHistory(repoInfo.gitRepo, repoInfo.relativeFilePath);
  
  var fileParts = repoInfo.relativeFilePath.match(itemFileRegEx);
  var itemId;
  if(fileParts === null) {
      // Match failed, likely repoInfo.relativeFilePath is Root.json
      fileParts = repoInfo.relativeFilePath;
      itemId = fileParts;
  } else {
      itemId = fileParts[1];
  }
  
  var historyResponse = {
      id: itemId,
      history: []
  };
  for (var i = 0; i < relatedCommits.length; i++) {
    var commit = relatedCommits[i];

      historyResponse.history.push({
        commit: commit.sha(),
        message: commit.message(),
        author: commit.author().name(),
        date: commit.date().getTime()
      });
  }
  
  historyResponse.history.sort(function (c1, c2) {
    return c2.date - c1.date;
  });
  
  callback(historyResponse);
}
module.exports.walkHistoryForFile = walkHistoryForFile;

function collectHistory(repo, path) {
  var relatedCommits = [];
  var name = path.substring(path.lastIndexOf("/") + 1, path.lastIndexOf(".json"));
  for (var r in repoList) {
    if (repoList[r].repo == repo) {
      var history = repoList[r].history;
      for (var j = 0; j < history.length; j++) {
        var files = history[j].files;
        fileLoop: for (var k = 0; k < files.length; k++) {
          var names = files[k].names;
          for (var l = 0; l < names.length; l++) {
            if (-1 != names.indexOf(name)) {
              relatedCommits.push(history[j].commit);
              break fileLoop;
            }
          }
        }
      }
      
      break;
    }
  }
  
  return relatedCommits;
}
