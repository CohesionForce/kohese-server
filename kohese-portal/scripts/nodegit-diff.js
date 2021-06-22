/*
 * Copyright (c) 2021 CohesionForce inc. | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


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
