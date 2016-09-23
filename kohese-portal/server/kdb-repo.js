/**
 * Knowledge Database Repo Management
 */


var nodegit = require('nodegit');
var path = require("path");

var itemFileRegEx = /^.*\/([0-9a-f\-]*(\/Root)?)\.json$/;
var repoFileSplitRegEx = /^(kdb\/kohese-kdb)\/(.*)$/;

function openRepo(repoPath, callback){
  console.log("::: Opening repo " + repoPath);

  nodegit.Repository.open(repoPath)
    .then(function(repo){
      console.log(">>> Opened repo");
      console.log(repo);
      callback(repo);
    });
}
module.exports.openRepo = openRepo;

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

function walkHistoryForFile(fileToAnalyze, callback){
  
  var repo = global.koheseKDB.repoList.ROOT;
  var relativeFileParts = fileToAnalyze.match(repoFileSplitRegEx);
  fileToAnalyze = relativeFileParts[2];

  console.log("::: Walking History for " + fileToAnalyze);
  console.log(repo);
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

      walker = repo.createRevWalk();
      walker.push(lastSha);
      walker.sorting(nodegit.Revwalk.SORT.TIME);

      return walker.fileHistoryWalk(fileToAnalyze, 500)
        .then(compileHistory);
    } else {
      // Did not find any commits
      return;
    }
  }

  repo.getMasterCommit()
  .then(function(firstCommitOnMaster){
    // History returns an event.
    
    walker = repo.createRevWalk();
    walker.push(firstCommitOnMaster.sha());
    walker.sorting(nodegit.Revwalk.SORT.Time);
    return walker.fileHistoryWalk(fileToAnalyze, 500);
  })
  .then(compileHistory)
  .then(function() {

    var fileParts = fileToAnalyze.match(itemFileRegEx);
    var itemId = fileParts[1];

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

