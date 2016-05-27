
console.log("::: Begin test nodegit");

var nodegit = require('nodegit');
var path = require("path");

function getStatus (repo){
  //This code shows working directory changes similar to git status
  repo.getStatusExt().then(function(statuses) {
    function statusToText(status) {
      var words = [];
      if (status.isNew()) { words.push("NEW"); }
      if (status.isModified()) { words.push("MODIFIED"); }
      if (status.isTypechange()) { words.push("TYPECHANGE"); }
      if (status.isRenamed()) { words.push("RENAMED"); }
      if (status.isIgnored()) { words.push("IGNORED"); }

      return words.join(" ");
    }
    
    var repoStatus = [];
    
    statuses.forEach(function(file) {
      console.log(file.path() + " " + statusToText(file));
      repoStatus.push({path: file.path(), status: statusToText(file)});
//      console.log(file);
      console.log(file.status());
    });
    
    console.log(repoStatus);

  });
}

//This code examines the diffs between a particular commit and all of its
//parents. Since this commit is not a merge, it only has one parent. This is
//similar to doing `git show`.


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
            patch.hunks().then(function(hunks) {
              hunks.forEach(function(hunk) {
                hunk.lines().then(function(lines) {
                  console.log("diff", patch.oldFile().path(),
                    patch.newFile().path());
                  console.log(hunk.header().trim());
                  lines.forEach(function(line) {
                    console.log(String.fromCharCode(line.origin()) +
                      line.content().trim());
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

nodegit.Repository.open("kdb/kohese-kdb")
  .then(function(repo) {
    console.log("::: Repo is open");
    
    getStatus(repo);
    commitWithFileRenames = "facbe3cd973f5d0f39dbe65c5102ba443674db34";
    commitWithSmallerChanges = "43d651aa104fe58c57c53a972e3575c12d278939";
    
    //getCommitDetails(repo, commitWithFileRenames);
});

console.log("::: End test nodegit");
console.log("::: Waiting for completion");

