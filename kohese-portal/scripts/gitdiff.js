/**
 *  This script gets the difference between the working tree 
 *  and index using nodegit
 *  
 *  usage: node scripts/gitdiff.js <path to repo>
 */

var nodegit = require('nodegit');

var repoPath = "kdb/kohese-kdb"

    if(process.argv[2]) {
        repoPath = process.argv[2];
    }

console.log('Opening KDB repo...');

nodegit.Repository.open(repoPath).then(function(repo) {

    console.log('Repo Open...');

    /* If not doing indexToWorkdir use
    *   commit.getDiff().then(function(arrayDiff) { ... });
    *  and process the array of diffs as below. This obtains the diff between commit and the one prior.
    *  
    *  If the above command is crashing try re-obtaining the commit:
    *    nodegit.Commit.lookup(repo, crashingCommit.id()).then(function(commit) { ... }
    */
    nodegit.Diff.indexToWorkdir(repo).then(function(diff) {
        diff.patches().then(function(arrayConvenientPatch) {
            arrayConvenientPatch.forEach(function(entry) {
                // To get diff for a particular file, match with entry.newFile().path()
                console.log(entry.newFile().path());
                console.log(entry.lineStats());

                entry.hunks().then(function(arrayConvenientHunks) {
                    var hunk = arrayConvenientHunks[0];
                    // hunk is a convenientHunk and isn't documented on the api
                    // see: https://github.com/nodegit/nodegit/blob/master/generate/templates/manual/src/convenient_hunk.cc

                    hunk.lines().then(function(arrayDiffLine) {
                        var content = hunk.header();
                        arrayDiffLine.forEach(function(diffLine) {
                            // line origin (+, -, etc) is given as integer representing ascii
                            content += String.fromCharCode(diffLine.origin());
                            content += diffLine.content();
                        });
                        console.log(content);
                    }).done();
                }).done();
            });
        }).done();
    }).done();

}).done();
