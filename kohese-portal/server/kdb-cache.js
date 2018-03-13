/**
 *
 */

'use strict';
var path = require('path');
var kdbFS = require('./kdb-fs.js');

var nodegit = require('nodegit');

var ItemProxy = require('../common/src/item-proxy.js');
var ItemCache = require('../common/src/item-cache.js');

const CACHE_DIRECTORY = path.join('kdb', 'cache');
const OBJECT_DIRECTORY = path.join(CACHE_DIRECTORY, 'git-object');
const COMMIT_DIRECTORY = path.join(OBJECT_DIRECTORY, 'commit');
const EXPAND_COMMIT_DIRECTORY = path.join(OBJECT_DIRECTORY, 'expand-commit');
const BLOB_DIRECTORY = path.join(OBJECT_DIRECTORY, 'blob');
const BLOB_MISMATCH_DIRECTORY = path.join(OBJECT_DIRECTORY, 'mismatch_blob');
const TREE_DIRECTORY = path.join(OBJECT_DIRECTORY, 'tree');
const HASHMAP_DIRECTORY = path.join(OBJECT_DIRECTORY, 'hashmap');

const compareOIDs = false;
const expandCommits = true;
const createHashMaps = true;

class KDBCache extends ItemCache {

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  constructor(repoPath) {

    super();

    KDBCache.repoPath = repoPath;

    KDBCache.loadCachedObjects();

    // Then check index for new commits

  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static convertBlob(object) {
    var blobObject;

    try {
      // Try to convert the blob to a JSON object
      blobObject = JSON.parse(object);
    } catch (err) {
      // If error, then it must be a binary file
      blobObject = {
          binary: object
      };
    }
    return blobObject;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static loadCachedObjects() {

    kdbFS.createDirIfMissing(CACHE_DIRECTORY);
    kdbFS.createDirIfMissing(OBJECT_DIRECTORY);
    kdbFS.createDirIfMissing(COMMIT_DIRECTORY);
    kdbFS.createDirIfMissing(EXPAND_COMMIT_DIRECTORY);
    kdbFS.createDirIfMissing(HASHMAP_DIRECTORY);
    kdbFS.createDirIfMissing(TREE_DIRECTORY);
    kdbFS.createDirIfMissing(BLOB_DIRECTORY);
    kdbFS.createDirIfMissing(BLOB_MISMATCH_DIRECTORY);

    console.log('::: Loading cached objects');
    var oidFiles = kdbFS.getRepositoryFileList(BLOB_DIRECTORY);

    var parseMismatch = 0;
    oidFiles.forEach((oidFile) => {
      var oid = oidFile.replace(/\.json$/, '');
      try {
        var object = kdbFS.loadBinaryFile(BLOB_DIRECTORY + '/' + oidFile);
        var blob = this.convertBlob(object);

        if (compareOIDs){
          var koid = ItemProxy.gitFileOID(object);
          if (oid !== koid){
            console.log('!!! Mismatch for ' + oid + ' - ' + koid);
          } else {
            try {
              var item = JSON.parse(object);
              var koid2 = ItemProxy.gitDocumentOID(item);

              if (oid !== koid2){
                console.log('!!! Parse yields mismatch: ' + oid);
                kdbFS.storeJSONDoc(BLOB_MISMATCH_DIRECTORY + '/' + oid + '_' + koid2 + '.json', item);

                parseMismatch++;
              }
            } catch (err) {
              console.log('*** Error parsing ' + oid);
              console.log(err);
            }
          }
        }
        this.cacheBlob(oid, blob);
      } catch (err) {
        console.log('*** Could not load cached blob:  ' + oid);
        console.log(err);
      }
    });
    console.log('::: Found ' + this.numberOfBlobs() + ' blobs');
    if(parseMismatch){
      console.log('::: Found ' + parseMismatch + ' parse mismatches');
    }

    oidFiles = kdbFS.getRepositoryFileList(TREE_DIRECTORY, /\.json$/);
    oidFiles.forEach((oidFile) => {
      var oid = oidFile.replace(/\.json$/, '');
      var object = kdbFS.loadJSONDoc(TREE_DIRECTORY + '/' + oidFile);
      this.cacheTree(oid, object);
    });
    console.log('::: Found ' + this.numberOfTrees() + ' trees');

    oidFiles = kdbFS.getRepositoryFileList(COMMIT_DIRECTORY, /\.json$/);
    oidFiles.forEach((oidFile) => {
      var oid = oidFile.replace(/\.json$/, '');
      var object = kdbFS.loadJSONDoc(COMMIT_DIRECTORY + '/' + oidFile);
      this.cacheCommit(oid, object);
    });
    console.log('::: Found ' + this.numberOfCommits() + ' commits');
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static addCachedObject(type, oid, object) {

    switch (type) {
      case 'commit':
        this.cacheCommit(oid, object);
        kdbFS.storeJSONDoc(COMMIT_DIRECTORY + path.sep + oid + '.json', object);

        if (expandCommits){
          var expandedCommitFilename = object.time + '_' + oid + '.json';
          kdbFS.storeJSONDoc(EXPAND_COMMIT_DIRECTORY + path.sep + expandedCommitFilename, this.expandCommit(oid));
        }
        if (createHashMaps){
          ItemProxy.resetItemRepository();
          this.loadProxiesForCommit(oid);
          var treeHash = ItemProxy.getAllTreeHashes();
          var hashmapFilename = object.time + '_' + oid + '.json';
          kdbFS.storeJSONDoc(HASHMAP_DIRECTORY + path.sep + hashmapFilename, treeHash);
        }
        break;
      case 'tree':
        this.cacheTree(oid, object);
        kdbFS.storeJSONDoc(TREE_DIRECTORY + path.sep + oid + '.json', object);
        break;
      case 'blob':
        object = this.convertBlob(object);
        this.cacheBlob(oid, object);
        if (object.binary) {
          kdbFS.storeBinaryFile(BLOB_DIRECTORY + path.sep + oid, object.binary);
        } else {
          kdbFS.storeJSONDoc(BLOB_DIRECTORY + path.sep + oid + '.json', object);
        }
        break;
      default:
        console.log('*** Unexpected type (' + type + ') for ' + oid);
    }

  }

  //////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////
  //// Generate index files
  //////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////


  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static generateCommitHistoryIndices(repoPath) {
    var kdbCache = this;
    return nodegit.Repository.open(repoPath).then(function (repo) {
      return repo.getMasterCommit().then(function (masterCommit) {
        var revwalk = nodegit.Revwalk.create(repo);
        revwalk.sorting(nodegit.Revwalk.SORT.TIME);
        revwalk.push(masterCommit.id());
        // eslint-disable-next-line no-unused-vars
        return revwalk.getCommitsUntil(function (commit) {
          return true;
        }).then(function (commits) {
          return kdbCache.indexCommit(repo, commits);
        });
      });
    });
  }


  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static indexCommit(repository, commits) {
    var kdbCache = this;
    var commit = commits.shift();

    // Exit recursion after all commits have been processed
    if(!commit){
      return;
    }

    if (this.cachedCommit(commit.id())){
      console.log('::: Already indexed commit ' + commit.id());
      return this.indexCommit(repository, commits);
    } else {
      console.log('::: Processing commit ' + commit.id());

      return commit.getTree().then(function (tree) {
        var co = {
          time: commit.timeMs(),
          author: commit.author().toString(),
          message: commit.message(),
          parents: [],
          treeId: tree.id().toString()
        };
        for (var j = 0; j < commit.parentcount(); j++) {
          co.parents.push(commit.parentId(j).toString());
        }

        // eslint-disable-next-line no-unused-vars
        var commitDataPromise = new Promise((resolve, reject) => {
          kdbCache.parseTree(repository, tree).then(() => {
            resolve(co);
          });
        });

        return commitDataPromise;
      }).then(function (co) {

        kdbCache.addCachedObject('commit', commit.id(), co);

        return kdbCache.indexCommit(repository, commits);
      }).catch(function (err) {
        console.log(err.stack);
      });
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static parseTree(repository, tree) {
    var kdbCache = this;
    var promises = [];
    var entries = {};
    for (var j = 0; j < tree.entryCount(); j++) {
      var entry = tree.entryByIndex(j);

      entries[entry.name()] = {
          type: (entry.isTree() ? 'tree' : 'blob'),
          oid: entry.sha()
      };

      if (entry.isTree()) {
        // Retrieve subtree if it is not already cached
        if (!this.cachedTree(entry.sha())){
          // jshint -W083
          promises.push(entry.getTree().then(function (t) {
            return kdbCache.parseTree(repository, t);
          }));
          // jshint +W083
        }
      } else {
        // Retrieve Blob if it is not already cached
        var oid = entry.sha();
        if (!this.cachedBlob(oid)){
          promises.push(this.getContents(repository, oid));
        }
      }
    }

    this.addCachedObject('tree', tree.id(), entries);

    return Promise.all(promises);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static getContents(repository, oid) {
    var kdbCache = this;
    return nodegit.Blob.lookup(repository, nodegit.Oid
      .fromString(oid)).then(function (blob) {
        kdbCache.addCachedObject('blob', oid, blob.content());
        return Promise.resolve(oid);
    }).catch(function (err) {
      console.log('*** Error retreiving: ' + oid);
      console.log(err.stack);
    });
  }

}

module.exports = KDBCache;
