const git = require("nodegit");
var branch = process.argv[2];

git.Repository.open(".").then(function (repo) {
   return repo.getHeadCommit().then(function (commit) {
      return repo.createBranch(branch, commit, false);
   }).then(function (ref) {
      return repo.checkoutBranch(ref);
   });
}).then(function () {
   console.log(branch + " checked out.");
}).catch(function (err) {
   console.log(err);
});
