const git = require("nodegit");
var treeId = process.argv[2];

git.Repository.open(".").then(function(repo) {
   var signature = git.Signature.create("username", "e-mail@e-mail.com", new Date().getTime(), 0);
   return repo.createCommit("HEAD", signature, signature, "some message", treeId, []);
}).then(function(id) {
   console.log("Commit ID: " + id);
});
