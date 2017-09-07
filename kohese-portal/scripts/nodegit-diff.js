const git = require("nodegit");

git.Repository.open(".").then(function(repo) {
   return repo.getHeadCommit().then(function (commit) {
      return commit.getTree().then(function (tree) {
         return git.Diff.treeToWorkdirWithIndex(repo, tree, null);
      });
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
}).then(function (diffContent) {
   console.log(diffContent.join("\n"));
}).catch(function (err) {
   console.log(err);
});
