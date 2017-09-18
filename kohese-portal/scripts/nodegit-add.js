const git = require("nodegit");
var path = process.argv[2];

git.Repository.open(".").then(function(repo) {
   return repo.refreshIndex();
}).then(function(index) {
   return index.addByPath(path).then(function(result) {
      return index.write();
   }).then(function(result) {
      return index.writeTree();
   });
}).then(function(id) {
   console.log("ID: " + id);
});
