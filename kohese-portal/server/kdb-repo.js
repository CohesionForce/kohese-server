/**
 * Knowledge Database Repo Management
 */


var nodegit = require('nodegit');
var path = require("path");

var itemFileRegEx = /^.*\/([0-9a-f\-]*(\/Root)?)\.json$/;
var repoFileSplitRegEx = /^(kdb\/kohese-kdb)\/(.*)$/;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function openRepo(repoPath) {
    console.log("::: Opening git repo " + repoPath);
    return nodegit.Repository.open(repoPath);
}
module.exports.openRepo = openRepo;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function initializeRepository(repoPath) {
	return nodegit.Repository.init(repoPath, 0);
}
module.exports.initializeRepository = initializeRepository;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function add(repo, path) {
	return repo.refreshIndex().then(function(index) {
	   return index.addByPath(path).then(function(result) {
	      return index.write();
	   }).then(function(result) {
	      return index.writeTree();
	   });
	});
}
module.exports.add = add;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function commit(repo, treeId, signature, message) {
    // TODO Does "HEAD" need to be a variable?
    // TODO Obtaining of treeId
    return repo.createCommit("HEAD", signature, signature, message, treeId, []);
}
module.exports.commit = commit;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function push(repo, remoteName) {
  return repo.getRemote(remoteName).then(function(remote) {
	  // TODO Does the refs String below need to change?
       return remote.push(["refs/heads/master:refs/heads/master"],
          {
             callbacks: {
                credentials: function(url, username) {
                   return nodegit.Cred.sshKeyFromAgent(username);
                }
             }
          });
       });
}
module.exports.push = push;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function checkout(repo, branchName) {
  /* TODO Does a non-HEAD checkout capability need to be available?
  Also, what about forcing creation of branch name that already
  exist? */
  return repo.getHeadCommit().then(function (commit) {
    return repo.createBranch(branchName, commit, false);
  }).then(function (ref) {
    return repo.checkoutBranch(ref);
  });
}
module.exports.checkout = checkout;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function reset(repo, paths) {
  return repo.getHeadCommit().then(function (commit) {
    return nodegit.Reset.default(repo, commit, paths);
  });
}
module.exports.reset = reset;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function diff(repo) {
  return repo.getHeadCommit().then(function (commit) {
    return commit.getTree().then(function (tree) {
       return nodegit.Diff.treeToWorkdirWithIndex(repo, tree, null);
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
function addRemote(repo, remoteName, remoteUrl) {
  return nodegit.Remote.create(repo, remoteName, remoteUrl);
}
module.exports.addRemote = addRemote;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function fetch(repo, remoteName) {
  return repo.fetch(remoteName, {
    callbacks: {
      credentials: function (url, username) {
        return nodegit.Cred.sshKeyFromAgent(username);
      }
    }
  })
}
module.exports.fetch = fetch;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function merge(repo, signature) {
  return Promise.join(repo.getHeadCommit(), repo.getMasterCommit(), function (hc, mc) {
    var index = nodegit.Merge.commits(repo, hc, mc, null);
    if (index.hasConflicts()) {
      // TODO Handle conflicts
    }
    
    return index.writeTreeTo(repo).then(function (treeId) {
      return repo.createCommit("HEAD", signature, signature, "Merge from master to HEAD.", treeId, [hc, mc])
    });
  });
}
module.exports.merge = merge;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function pull(repo, remoteName, signature) {
  return fetch(repo, remoteName).then(function () {
    return merge(repo, signature);
  });
}
module.exports.pull = pull;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function repoRelativePathOf(proxy){
  
  var filePath = proxy.repoPath;
  var repoProxy = proxy.getRepositoryProxy();
  var gitRepo = global.koheseKDB.repoList[repoProxy.item.id];

  while(!gitRepo) {
      if(!repoProxy.parentProxy){
          console.log('!!! Cannot find a git repo containing ' + filePath);
          return;
      }
      
      repoProxy = repoProxy.parentProxy.getRepositoryProxy();
      gitRepo = global.koheseKDB.repoList[repoProxy.item.id];
  }
  
  var pathToRepo = repoProxy.repoPath.split('Root.json')[0];
  var relativeFilePath = filePath.split(pathToRepo)[1];

  return {
    repoProxy: repoProxy,
    gitRepo: gitRepo,
    pathToRepo: pathToRepo,
    relativeFilePath: relativeFilePath
  };
}
module.exports.repoRelativePathOf = repoRelativePathOf;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function getStatus (repo, callback){
  //This code gets working directory changes similar to git status
  repo.getStatusExt().then(function(statuses) {
    
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
function getItemStatus(gitRepo, relativeFilePath) {
	var status = [];
	var statNum = nodegit.Status.file(gitRepo, relativeFilePath);
	
	for (var s in nodegit.Status.STATUS) {
		if ((statNum & nodegit.Status.STATUS[s]) != 0) {
			status.push(s);
		}
	}
	
	return status;
}
module.exports.getItemStatus = getItemStatus;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function walkHistoryForFile(proxy, callback){
  
  var repoInfo=repoRelativePathOf(proxy);
  
  console.log("::: Walking History for " + proxy.item.id + ' in ' + repoInfo.pathToRepo + ' at ' + repoInfo.relativeFilePath);
  var walker;
  var historyCommits = [];
  var commit;

  function compileHistory(resultingArrayOfCommits) {

    var lastSha;
    if (historyCommits.length > 0) {
      lastSha = historyCommits[historyCommits.length - 1].commit.sha();
      if (
        resultingArrayOfCommits.length == 1 &&
        resultingArrayOfCommits[0].commit.sha() == lastSha
      ) {
        return;
      }
    }

    resultingArrayOfCommits.forEach(function(entry) {
      historyCommits.push(entry);
    });

    if (historyCommits.length > 0){
      // Found at least one commit
      lastSha = historyCommits[historyCommits.length - 1].commit.sha();

      walker = repoInfo.gitRepo.createRevWalk();
      walker.push(lastSha);
      walker.sorting(nodegit.Revwalk.SORT.TIME);

      return walker.fileHistoryWalk(repoInfo.relativeFilePath, 500)
        .then(compileHistory);
    } else {
      // Did not find any commits
      return;
    }
  }

  repoInfo.gitRepo.getMasterCommit()
  .then(function(firstCommitOnMaster){
    // History returns an event.
    
    walker = repoInfo.gitRepo.createRevWalk();
    walker.push(firstCommitOnMaster.sha());
    walker.sorting(nodegit.Revwalk.SORT.Time);
    return walker.fileHistoryWalk(repoInfo.relativeFilePath, 500);
  })
  .then(compileHistory)
  .then(function() {

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
    historyCommits.forEach(function(entry) {
      commit = entry.commit;

      historyResponse.history.push({
        commit: commit.sha(),
        message: commit.message(),
        author: commit.author().name(),
        date: commit.date().getTime()
      });
      
    });

    callback(historyResponse);
  })
  .done();
}
module.exports.walkHistoryForFile = walkHistoryForFile;
