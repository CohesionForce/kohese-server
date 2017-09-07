const git = require("nodegit");
var path = process.argv[2];

git.Repository.open(".").then(function (repo) {
   return repo.getHeadCommit().then(function (commit) {
      return git.Reset.default(repo, commit, [path]);
   });
}).then(function (result) {
   console.log(result);
});
