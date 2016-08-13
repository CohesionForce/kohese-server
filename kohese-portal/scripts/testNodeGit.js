
console.log("::: Begin test nodegit");

var nodegit = require('nodegit');
var path = require("path");

var itemFileRegEx = /^.*\/([0-9a-f\-]*)\.json$|^.*\/([0-9a-f\-]*\/Root)\.json$/;

function getStatus (repo){
  //This code shows working directory changes similar to git status
  repo.getStatusExt().then(function(statuses) {
//    function statusToText(status) {
//      var words = [];
//      if (status.isNew()) { words.push("NEW"); }
//      if (status.isModified()) { words.push("MODIFIED"); }
//      if (status.isTypechange()) { words.push("TYPECHANGE"); }
//      if (status.isRenamed()) { words.push("RENAMED"); }
//      if (status.isIgnored()) { words.push("IGNORED"); }
//
//      return words.join(" ");
//    }
    
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

    console.log("::: Send this status")
    console.log(repoStatus);

  });
}

// This code examines the diffs between a particular commit and all of its
//parents. Since this commit is not a merge, it only has one parent. This is
//similar to doing `git show`.

function showDelta () {
}


function getCommitDetails (repo, commitOID){
  repo.getCommit(commitOID).then(function(commit) {
    console.log("commit " + commit.sha());
    console.log("Author:", commit.author().name() +
      " <" + commit.author().email() + ">");
    console.log("Date:", commit.date());
    console.log("\n    " + commit.message());
    
    commit.getDiff().then(function(diffList){
      diffList.forEach(function(diff) {
        diff.patches().then(function(patches) {
          patches.forEach(function(patch) {
            console.log("::: Analyzing: " + patch.newFile().path());
            console.log(patch);
            patch.hunks().then(function(hunks) {
              console.log("::: Got Hunks for: " + patch.newFile().path());
              console.log(patch);
              hunks.forEach(function(hunk) {
                hunk.lines().then(function(lines) {
                  console.log("diff", patch.oldFile().path(),
                              patch.newFile().path());
                  console.log(hunk.header().trim());
                  lines.forEach(function(line) {
//                    console.log(String.fromCharCode(line.origin()) +
//                                line.content().trim());
                  });
                });
              });
            });
          });
        });
      });
    });  
  });
}

function walkHistoryForFile(repo, fileToAnalyze, callback){

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

    lastSha = historyCommits[historyCommits.length - 1].commit.sha();

    walker = repo.createRevWalk();
    walker.push(lastSha);
    walker.sorting(nodegit.Revwalk.SORT.TIME);

    return walker.fileHistoryWalk(fileToAnalyze, 500)
      .then(compileHistory);
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

nodegit.Repository.open("kdb/kohese-kdb")
//nodegit.Repository.open(".")
  .then(function(repo) {
    console.log("::: Repo is open");
    
    getStatus(repo);

    commitWithFileRenames = "facbe3cd973f5d0f39dbe65c5102ba443674db34";
    commitWithSmallerChanges = "43d651aa104fe58c57c53a972e3575c12d278939";
    commitWithSomeChanges = "b76990f9a91326a2656ed666681b7d5e90e36b6e";
    
    
//    getCommitDetails(repo, commitWithSomeChanges);

    var fileToAnalyze= "export/Repository/4a733240-6d21-11e5-ae5b-1ba25b1f580f/Item/c5854ab0-37a4-11e6-a58d-a33a25a82097.json";
//    fileToAnalyze= "./scripts/testNodeGit.js";
    walkHistoryForFile(repo, fileToAnalyze, function (history){
      console.log("::: History")
      console.log(history);      
    });
});

console.log("::: End test nodegit");
console.log("::: Waiting for completion");

