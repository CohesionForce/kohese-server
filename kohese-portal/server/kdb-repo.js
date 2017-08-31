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
function openRepo(repoPath, repoList, id) {
    console.log("::: Opening git repo " + repoPath);
    nodegit.Repository.open(repoPath)
    .then(function(repo) {
//        console.log("+++ Opened git repo at " + repo.path());
        repoList[id] = repo;
    }, function(err) {
//        console.log("!!! " + err);
    });
}
module.exports.openRepo = openRepo;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function repoRelativePathOf(proxy){
  
  var filePath = proxy.repoPath;
  var repoProxy = proxy.getRepositoryProxy();
  var gitRepo = global.koheseKDB.repoList[repoProxy.item.id];

  while(!gitRepo) {
      if(repoProxy.item.id === 'ROOT'){
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
function walkHistoryForFile(proxy, callback){
  
  repoInfo=repoRelativePathOf(proxy);
  
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
