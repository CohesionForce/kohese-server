/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
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


/**
 * Knowledge Database Repo Management
 */

let nodegit = require ('nodegit');
import * as path from 'path';
import * as fs from 'fs';

let Path = require('path');

let repoList = {};
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(\-mount)?$/i;

export class KDBRepo {
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static async openRepo(repositoryId, repositoryPath) {
    console.log('::: Opening git repo ' + repositoryId + ' ' + repositoryPath);
    return nodegit.Repository.open(repositoryPath).then(function (r) {
      repoList[repositoryId] = r;
    }).catch(function (err) {
      console.log('*** Error opening repository at ' + repositoryPath + '. ' + err);
    });
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static async closeRepo(repositoryId) {
    console.log('::: Unmounting git repo ' + repositoryId);
    delete repoList[repositoryId];
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static async getCommitFilesChanged(commit) {
    return commit.getDiff().then(function (diffs) {
      var diffOpts = {
          flags: nodegit.Diff.FIND.RENAMES
      };
      var diffPromise = [];
      var paths = [];
      for (var j = 0; j < diffs.length; j++) {
        (function (jIndex) {
          diffPromise.push(diffs[jIndex].findSimilar(diffOpts).then(function (result) {
            for (var k = 0; k < diffs[jIndex].numDeltas(); k++) {
              var p = diffs[jIndex].getDelta(k).newFile().path();
              if (-1 === paths.indexOf(p)) {
                paths.push(p);
              }
            }
          }));
        })(j);
      }

      return Promise.all(diffPromise).then(function () {
        return paths;
      });
    });
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static async getIndexEntries(tree, paths) {
    var p;
    if (paths.length > 0) {
      var entryPromises = [];
      for (var j = 0; j < paths.length; j++) {
        (function (jIndex) {
          var p = paths[jIndex];
          entryPromises.push(tree.entryByPath(p).then(function (entry) {
            if (entry) {
              return {
                uuid: p.substring(p.lastIndexOf(path.sep) + 1,
                    p.lastIndexOf('.json')),
                oid: entry.sha(),
                kind: path.basename(path.dirname(p))
              };
            }
          }));
        })(j);
      }

      p = Promise.all(entryPromises);
    } else {
      p = KDBRepo.parseTree(tree);
    }

    return p.then(function (entries) {
      var entryMap = {
        meta: {},
        objects: {}
      };

      entries.sort(function (e1, e2) {
        return (e1.uuid > e2.uuid ? 1 : (e1.uuid < e2.uuid ? -1 : 0));
      });

      for (var j = 0; j < entries.length; j++) {
        entryMap.objects[entries[j].uuid] = {
            oid: entries[j].oid,
            kind: entries[j].kind
          };
      }

      return entryMap;
    });
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static async parseTree(tree) {
    var promises = [];
    for (var j = 0; j < tree.entryCount(); j++) {
      var entry = tree.entryByIndex(j);
      if (entry.isTree()) {
        promises.push(entry.getTree().then(function (t) {
          return KDBRepo.parseTree(t);
        }));
      } else {
        var p = entry.path();
        var id = p.substring(p.lastIndexOf(path.sep) + 1, p.lastIndexOf('.json'));
        if (UUID_REGEX.test(id)) {
          promises.push(Promise.resolve({
            uuid: id,
            oid: entry.sha(),
            kind: path.basename(path.dirname(p))
          }));
        }
      }
    }

    return Promise.all(promises).then(function (results) {
      var objects = [];
      for (var j = 0; j < results.length; j++) {
        if (Array.isArray(results[j])) {
          for (var k = 0; k < results[j].length; k++) {
            objects.push(results[j][k]);
          }
        } else {
          objects.push(results[j]);
        }
      }

      return Promise.resolve(objects);
    });
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static async getContents(repositoryId, oid) {
    return nodegit.Blob.lookup(repoList[repositoryId], nodegit.Oid
      .fromString(oid)).then(function (o) {
      return JSON.parse(o.toString());
    }).catch(function (err) {
      console.log(err.stack);
    });
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static async initializeRepository(repositoryId, path) {
    return nodegit.Repository.init(path, 0).then(function (r) {
      repoList[repositoryId] = r;
    });
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static async add(repositoryId, filePath) {
    return repoList[repositoryId].refreshIndex().then(function (index) {
      return index.addByPath(filePath).then(function () {
        return index.write();
      }).then(function () {
        var statusPromise = KDBRepo.getItemStatus(repositoryId, filePath);
        return statusPromise.then((status) => {
          for (var j = 0; j < status.length; j++) {
            if (status[j].startsWith('INDEX_')) {
              return true;
            }
          }

          return false;
        });
      });
    });
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static async commit(repositoryIds : Array<string>, userName : string, eMail : string, message : string) {
    // TODO Does 'HEAD' need to be a variable?
    var commitIdMap = {};
    var signature = nodegit.Signature.now(userName, eMail);
    for (let repositoryId in repoList) {
      var repo = repoList[repositoryId];
      try {
        let commit = await repo.getHeadCommit();
        let index = await repo.refreshIndex();
        let treeId = await index.writeTree();
        let parentCommits = [];
        if (commit) {
          parentCommits.push(commit);
        }
        let statuses = await repo.getStatusExt();
        let filePaths = [];
        for (let j = 0; j < statuses.length; j++) {
          let status = statuses[j];
          if (status.inIndex()) {
            filePaths.push(status.path());
          }
        }
        if (filePaths.length > 0) {
          let commitId = await repo.createCommit('HEAD', signature, signature, message, treeId, parentCommits);
          commitIdMap[repositoryId] = {
            commitId: commitId,
            filesCommitted: filePaths
          };
          let c = await repo.getCommit(commitId)
          if (!c) {
            console.log('*** Commit Not Sucessful');
          }
        } else {
          console.log('))))) No File to Commit');
        }
      } catch (err) {
        console.log('*** Error:  ' + err);
        console.log(err.stack);
      }
    }

      console.log('*** Commit Id map ', commitIdMap);
      return commitIdMap;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static async push(repositoryIds, remoteName, defaultUser) {
    var pushStatusMap = {};
    var promises = [];
    for (var i = 0; i < repositoryIds.length; i++) {
      (function (iIndex) {
        promises.push(repoList[repositoryIds[iIndex]].getRemote(remoteName).then(function(remote) {
          // TODO Does the refs String below need to change?
          return remote.push(['refs/heads/master:refs/heads/master'], {
              callbacks: {
                credentials: function(url, u) {
                  // TODO Get the username from the given URL once we have
                  // upgraded our version of node.js
                  return nodegit.Cred.sshKeyFromAgent(defaultUser);
                }
              }
          }).then(function (status) {
            pushStatusMap[repositoryIds[iIndex]] = status;
          }).catch(function(err){
            console.log(err);
          });
        }));
      })(i);
    }

    return Promise.all(promises).then(function () {
      return pushStatusMap;
    });
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static async checkout(repositoryId, filePaths, force) {
    var repository = repoList[repositoryId];

    if (filePaths.length > 0) {
      var options = new nodegit.CheckoutOptions();
      options.paths = filePaths;
      options.checkoutStrategy = (force ? (nodegit.Checkout.STRATEGY.FORCE
          | nodegit.Checkout.STRATEGY.REMOVE_UNTRACKED) : (nodegit.Checkout.STRATEGY.SAFE
          | nodegit.Checkout.STRATEGY.ALLOW_CONFLICTS));
      return repository.refreshIndex().then(function (index) {
        return nodegit.Checkout.index(repository, index, options);
      });
    } else {
      return Promise.resolve(true);
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static async reset(repositoryId, filePaths) {
    var repository = repoList[repositoryId];
    return repository.getHeadCommit().then(function (commit) {
      return nodegit.Reset.default(repository, commit, filePaths);
    });
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static async diff(repositoryId) {
    var repository = repoList[repositoryId];
    return repository.getHeadCommit().then(function (commit) {
      return commit.getTree().then(function (tree) {
        return nodegit.Diff.treeToWorkdirWithIndex(repository, tree, null);
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
                diffContent.push('diff ' + p.oldFile().path() + ' ' + p.newFile().path());
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
    });
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static async addRemote(repositoryId, remoteName, remoteUrl) {
    return nodegit.Remote.create(repoList[repositoryId], remoteName, remoteUrl)
      .then(function (remote) {
        return remote.name();
    });
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static async getRemotes(repositoryId) {
    if (repositoryId !== 'ROOT') {
      return nodegit.Remote.list(repoList[repositoryId + '-mount']);
    } else {
      return nodegit.Remote.list(repoList[repositoryId]);
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static async fetch(repositoryId, remoteName) {
    return repoList[repositoryId].fetch(remoteName, {
      callbacks: {
        credentials: function (url, username) {
          return nodegit.Cred.sshKeyFromAgent(username);
        }
      }
    });
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static async merge(repositoryId, signature) {
    var repository = repoList[repositoryId];
    return Promise.all([repository.getHeadCommit(), repository.
      getMasterCommit()]).then(function (commits: Array<any>) {
      let headCommit: any = commits[0];
      let masterCommit: any = commits[1];
      var index = nodegit.Merge.commits(repository, headCommit, masterCommit,
        null);
      if (index.hasConflicts()) {
        // TODO Handle conflicts
      }

      return index.writeTreeTo(repository).then(function (treeId) {
        return repository.createCommit('HEAD', signature, signature,
          'Merge from master to HEAD.', treeId, [headCommit, masterCommit]);
      });
    });
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static async pull(repositoryId, remoteName, signature) {
    var repository = repoList[repositoryId];
    return KDBRepo.fetch(repository, remoteName).then(function () {
      return KDBRepo.merge(repository, signature);
    });
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static getMountId(id) {
    if (id.indexOf('-mount') !== -1) {
      // remove -mount from ID
      return  id.split('-mount')[0];
    }else {
      return id;
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  private static pendingGetRepoStatus = {};
  static async getRepoStatus (repositoryId) : Promise<any> {
    // This code gets working directory changes similar to git status
    var repoStatus = [];

    let statuses;

    if (repositoryId !== 'ROOT') {
      repositoryId = repositoryId + '-mount'
    }

    if (!repoList[repositoryId]) {
      repositoryId = 'ROOT'
    }

    if (!this.pendingGetRepoStatus[repositoryId]) {
      this.pendingGetRepoStatus[repositoryId] = repoList[repositoryId].getStatusExt();
    }
    statuses = await this.pendingGetRepoStatus[repositoryId];

    statuses.forEach(function (file) {

      let path = file.path();

      let itemId = undefined;

      if (path.endsWith('.json')) {
        itemId = Path.basename(path, '.json');
        if (!UUID_REGEX.test(itemId)) {
          itemId = Path.basename(Path.dirname(path));
          if (!UUID_REGEX.test(itemId)) {
            // Not an itemId, so reset to undefined
            itemId = undefined;
            if (path === 'Root.json') {
              itemId = KDBRepo.getMountId(repositoryId);
            } else if (path.includes('KoheseModel') || path.includes('KoheseView') || path.includes('Namespace')) {
              itemId = Path.basename(path, '.json')
            }

          }
        }
      }

      let fileStatus = {
        itemId: itemId,
        path: path,
        status: file.status()
      };

      if (!itemId) {
        delete fileStatus.itemId;
      }

      repoStatus.push(fileStatus);

    });

    delete this.pendingGetRepoStatus[repositoryId];

    return repoStatus;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  private static pendingGetStatus = {};
  static async getStatus () : Promise<any> {
    // This code gets working directory changes similar to git status
    var repoStatus = [];

    for (let repositoryId in repoList) {

      let repoId = KDBRepo.getMountId(repositoryId);

      repoStatus[repoId] = [];
      let statuses;

      if (!this.pendingGetStatus[repositoryId]) {
        this.pendingGetStatus[repositoryId] = repoList[repositoryId].getStatusExt();
      }
      statuses = await this.pendingGetStatus[repositoryId];

      statuses.forEach(function (file) {

        let path = file.path();

        let itemId = undefined;

        if (path.endsWith('.json')) {
          itemId = Path.basename(path, '.json');
          if (!UUID_REGEX.test(itemId)) {
            itemId = Path.basename(Path.dirname(path));
            if (!UUID_REGEX.test(itemId)) {
              // Not an itemId, so reset to undefined
              itemId = undefined;
              if (path === 'Root.json') {
                itemId = repoId;
              } else if (path.includes('KoheseModel') || path.includes('KoheseView') || path.includes('Namespace')) {
                itemId = Path.basename(path, '.json')
              }
            }
          }
        }

        let fileStatus = {
          itemId: itemId,
          path: path,
          status: file.status()
        };

        if (!itemId) {
          delete fileStatus.itemId;
        }

        repoStatus[repoId].push(fileStatus);

      });

      delete this.pendingGetStatus[repositoryId];
    }
      return repoStatus;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static async getItemStatus(repositoryId, filePath) {
    var status = [];
    console.log('::: Getting Item Status For ' + repositoryId + ' ' + filePath)
    var statPromise = nodegit.Status.file(repoList[repositoryId], filePath);
    return statPromise.then((statNum) => {
      for (var statusKey in nodegit.Status.STATUS) {
        if ((statNum & nodegit.Status.STATUS[statusKey]) !== 0) {
          status.push(statusKey);
        }
      }

      return status;
    }).catch ((error) => {
      return status;
    });

  }

  //////////////////////////////////////////////////////////////////////////
  static collectHistory(repo, path) {
    var relatedCommits = [];
    var name = path.substring(path.lastIndexOf("/") + 1, path.lastIndexOf(".json"));
    // TODO Fix this based on changes
    for (var r in repoList) {
      if (repoList[r].repo === repo) {
          var history = repoList[r].history;
          for (var j = 0; j < history.length; j++) {
            var files = history[j].files;
            fileLoop: for (var k = 0; k < files.length; k++) {
              var names = files[k].names;
              for (var l = 0; l < names.length; l++) {
                if (-1 != names.indexOf(name)) {
                  relatedCommits.push(history[j].commit);
                  break fileLoop;
                }
              }
            }
          }

          break;
      }
    }

    return relatedCommits;
    }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static async walkHistoryForRepoFile(gitRepo, relativeFilePath, callback){

    var relatedCommits = KDBRepo.collectHistory(gitRepo, relativeFilePath);

    var historyResponse = {
        file: relativeFilePath,
        history: []
    };
    for (var i = 0; i < relatedCommits.length; i++) {
      var commit = relatedCommits[i];

        historyResponse.history.push({
          commit: commit.sha(),
          message: commit.message(),
          author: commit.author().name(),
          date: commit.date().getTime()
          // TODO: Add path/OID
        });
    }

    historyResponse.history.sort(function (c1, c2) {
      return c2.date - c1.date;
    });

    callback(historyResponse);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static getRepoId(filePath) {
    if (filePath !== '') {
      var id: any = path.parse(filePath).base;
      if (repoList[id + '-mount']) {
        return id;
      } else {
        let repopath = filePath.substring(0, filePath.lastIndexOf('/'));
        this.getRepoId(repopath)
      }
    } else {
      id = undefined
      return id;
    }
  }
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static isRepo(id) {
    if (repoList[id + '-mount']) {
       return true;
    } else {
      return false;
    }
  }
}
