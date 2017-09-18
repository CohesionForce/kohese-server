const git = require("nodegit");
var remoteName = process.argv[2];
var remoteUrl = process.argv[3];

git.Repository.open(".").then(function (repo) {
   return git.Remote.create(repo, remoteName, remoteUrl);
}).then(function (remote) {
   console.log("Remote created successfully. " + remote);
});
