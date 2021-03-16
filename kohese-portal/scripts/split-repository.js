const nodegit = require("nodegit");
const fs = require("fs");
const Path = require("path");
var path = process.argv[2];
var destination = process.argv[3];
const CASCADE_LEVELS = 1;

start();

function start() {
  var ids = [];
  var files = [];
  for (var i = 4; i < process.argv.length; i++) {
    var f = process.argv[i];
    recurse(f, function (file, isDirectory) {
      files.push(file);
    });

    recurse(f, function (file, isDirectory) {
      if (!isDirectory) {
        var name = Path.basename(file);
        name = name.substring(0, name.lastIndexOf(".json"));
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(name)) {
          ids.push(name);
        }
      }
    });
  }

  console.log("::: Opening git repo " + path);
  return nodegit.Repository.init(destination, 0).then(function (destRepo) {
    return destRepo.refreshIndex().then(function (index) {
       return index.write();
    }).then(function () {
      return nodegit.Repository.open(path).then(function (r) {
        return r.getMasterCommit().then(function (mc) {
          var rw = nodegit.Revwalk.create(r);
          rw.sorting(nodegit.Revwalk.SORT.TIME);
          rw.push(mc.id());
          return rw.getCommitsUntil(function (c) {
            return true;
          }).then(function (commits) {
            return moveTo(ids, r, destRepo).then(function () {
              return r.refreshIndex().then(function (index) {
                return removeMoved(r, files).then(function () {
                  return index.write();
                }).then(function () {
                  return index.writeTree();
                }).then(function (treeId) {
                  return commit(r, treeId, "Kohese", "(no e-mail)", new Date().getTime(),
                    0, "Removed items that were split into " + destination).then(function () {
                    console.log("Remove commit processed.");
                  });
                });
              });
            });
          });
        });
      }).catch(function (err) {
        console.log("Error opening repository at " + path + ". " + err);
        console.log(err.stack);
      });
    });
  }).catch(function (err) {
    console.log(err.stack);
  });
}

function recurse(file, execute) {
  var stat = fs.statSync(file);
  var isDirectory = stat.isDirectory();
  if (isDirectory) {
    var f = fs.readdirSync(file);
    for (var i = 0; i < f.length; i++) {
      recurse(Path.join(file, f[i]), execute);
    }
  }

  execute(file, isDirectory);
}

function moveTo(ids, sourceRepo, destinationRepo) {
  var indexDirectory = Path.join("kdb", "index");
  var indices = fs.readdirSync(indexDirectory);
  var commits = [];
  for (var j = 0; j < indices.length; j++) {
    var commitId = indices[j].substring(0, indices[j].lastIndexOf(".json"));
    var content = JSON.parse(fs.readFileSync(Path.join(indexDirectory, indices[j])));
    var mapping = {
      id: commitId,
      time: content.meta.time,
      contents: {}
    };
    for (var k = 0; k < ids.length; k++) {
      var entry = content.objects[ids[k]];
      if (entry) {
        mapping.contents[ids[k]] = {
          oid: entry.oid,
          kind: entry.kind
        };
      }
    }

    if (Object.keys(mapping.contents).length > 0) {
      commits.push(mapping);
    }
  }

  commits.sort(function (m1, m2) {
    return m1.time - m2.time;
  });

  if (commits.length > 0) {
    var filteredCommits = [commits[0]];
    // Copy the contents
    var lastContents = JSON.parse(JSON.stringify(commits[0].contents));
    for (var j = 1; j < commits.length; j++) {
      var contents = commits[j].contents;
      for (var key in contents) {
        var lastEntry = lastContents[key];
        if (lastEntry && ((lastEntry.oid === contents[key].oid) && (lastEntry.kind === contents[key].kind))) {
          delete contents[key];
        } else {
          // Copy the contents
          lastContents[key] = JSON.parse(JSON.stringify(contents[key]));
        }
      }

      if (Object.keys(contents).length > 0) {
        filteredCommits.push(commits[j]);
      }
    }

    return processCommits(filteredCommits, sourceRepo, destinationRepo);
  }
}

function processCommits(commits, sourceRepo, destinationRepo) {
  if (commits.length > 0) {
    var mapping = commits.shift();
    return processEntries(Object.keys(mapping.contents), mapping.contents, sourceRepo, destinationRepo).then(function () {
      return destinationRepo.index();
    }).then(function (index) {
      return index.write().then(function () {
        return index.writeTree();
      });
    }).then(function (treeId) {
      return sourceRepo.getCommit(mapping.id).then(function (c) {
        return commit(destinationRepo, treeId, c.author().name(),
          c.author().email(), c.time(),
          c.timeOffset(), c.message()).then(function () {
          console.log(mapping.id + " processing complete.");
        });
      });
    }).then(function () {
      return processCommits(commits, sourceRepo, destinationRepo);
    }).catch(function (err) {
      console.log(err.stack);
    });
  }
}

function processEntries(contentKeys, contents, sourceRepo, destinationRepo) {
  if (contentKeys.length > 0) {
    var key = contentKeys.shift();
    var content = contents[key];
    return sourceRepo.getBlob(content.oid).then(function (obj) {
      //console.log("Found");
      // TODO New structure
      var writePath = Path.join(destination, content.kind, key + ".json");
      fs.writeFileSync(writePath, JSON.stringify(JSON.parse(obj.toString()),
        null, '  '));
      return add(destinationRepo, writePath.substring(writePath.indexOf(destination) + destination.length + 1));
    }).then(function () {
      return processEntries(contentKeys, contents, sourceRepo, destinationRepo);
    }).catch(function (err) {
      console.log(err.stack);
    });
  }
}

function removeMoved(sourceRepo, paths) {
  if (paths.length > 0) {
    var p = paths.shift();
    return sourceRepo.index().then(function (index) {
      return index.removeByPath(p);
    }).then(function () {
      var status = fs.statSync(p);
      if (status.isDirectory()) {
        fs.rmdirSync(p);
      } else {
        fs.unlinkSync(p);
      }

      return removeMoved(sourceRepo, paths);
    });
  }
}

function add(repo, file) {
  return repo.index().then(function(index) {
    return index.addByPath(file);
  });
}

function commit(repo, treeId, name, eMail, time, offset, message) {
  var s = nodegit.Signature.create(name, eMail, time, offset);
  return repo.getHeadCommit().then(function (commit) {
    var parents = [];
    if (commit) {
      parents.push(commit);
    }
    return repo.createCommit("HEAD", s, s, message,
      treeId, parents);
  });
}

function getWriteLocation(id) {
  for (var j = 0; j < CASCADE_LEVELS; j++) {

  }
}

