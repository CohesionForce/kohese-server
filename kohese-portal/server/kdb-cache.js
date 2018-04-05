/**
 *
 */

'use strict';
var path = require('path');
var kdbFS = require('./kdb-fs.js');

var nodegit = require('nodegit');

var ItemProxy = require('../common/src/item-proxy.js');
var ItemCache = require('../common/src/item-cache.js');

const compareOIDs = false;
const expandCommits = true;
const createHashMaps = true;

class KDBCache extends ItemCache {

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  constructor(repoPath) {

    super();

    this.repoPath = repoPath;
    console.log('::: Loading Cache for ' + repoPath);

    this.cacheDirectory = path.join(repoPath, '.cache');
    this.objectDirectory = path.join(this.cacheDirectory, 'objects');
    this.commitDirectory = path.join(this.objectDirectory, 'commit');
    this.treeDirectory = path.join(this.objectDirectory, 'tree');
    this.blobDirectory = path.join(this.objectDirectory, 'blob');
    this.blobMismatchDirectory = path.join(this.objectDirectory, 'mismatch_blob');
    this.expandedCommitDirectory = path.join(this.cacheDirectory, 'expand-commit');
    this.hashmapDirectory = path.join(this.cacheDirectory, 'hashmap');

    kdbFS.createDirIfMissing(this.cacheDirectory);
    kdbFS.createGITIgnoreAllIfMissing(this.cacheDirectory + '/.gitignore');
    kdbFS.createDirIfMissing(this.objectDirectory);
    kdbFS.createDirIfMissing(this.commitDirectory);
    kdbFS.createDirIfMissing(this.treeDirectory);
    kdbFS.createDirIfMissing(this.blobDirectory);
    kdbFS.createDirIfMissing(this.blobMismatchDirectory);
    kdbFS.createDirIfMissing(this.expandedCommitDirectory);
    kdbFS.createDirIfMissing(this.hashmapDirectory);


    // Load Cached Objects From Prior Runs
    var beforeTime = Date.now();
    this.loadCachedObjects();
    var afterTime = Date.now();
    var deltaLoadTime = afterTime-beforeTime;
    console.log('::: Load time for cached objects in ' + this.repoPath + ': ' + deltaLoadTime/1000);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  convertBlob(object) {
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
  loadCachedObjects() {

    console.log('::: Loading cached objects');
    var oidFiles = kdbFS.getRepositoryFileList(this.blobDirectory);

    var parseMismatch = 0;
    oidFiles.forEach((oidFile) => {
      var oid = oidFile.replace(/\.json$/, '');
      try {
        var object = kdbFS.loadBinaryFile(this.blobDirectory + '/' + oidFile);
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
                kdbFS.storeJSONDoc(this.blobMismatchDirectory + '/' + oid + '_' + koid2 + '.json', item);

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

    oidFiles = kdbFS.getRepositoryFileList(this.treeDirectory, /\.json$/);
    oidFiles.forEach((oidFile) => {
      var oid = oidFile.replace(/\.json$/, '');
      var object = kdbFS.loadJSONDoc(this.treeDirectory + '/' + oidFile);
      this.cacheTree(oid, object);
    });
    console.log('::: Found ' + this.numberOfTrees() + ' trees');

    oidFiles = kdbFS.getRepositoryFileList(this.commitDirectory, /\.json$/);
    oidFiles.forEach((oidFile) => {
      var oid = oidFile.replace(/\.json$/, '');
      var object = kdbFS.loadJSONDoc(this.commitDirectory + '/' + oidFile);
      this.cacheCommit(oid, object);
    });
    console.log('::: Found ' + this.numberOfCommits() + ' commits');
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  addCachedObject(type, oid, object) {

    switch (type) {
      case 'commit':
        this.cacheCommit(oid, object);
        kdbFS.storeJSONDoc(this.commitDirectory + path.sep + oid + '.json', object);

        if (expandCommits){
          var expandedCommitFilename = object.time + '_' + oid + '.json';
          kdbFS.storeJSONDoc(this.expandedCommitDirectory + path.sep + expandedCommitFilename, this.expandCommit(oid));
        }
        if (createHashMaps){
          let skipModels = true;
          ItemProxy.resetItemRepository(skipModels);
          this.loadProxiesForCommit(oid);
          var treeHash = ItemProxy.getAllTreeHashes();
          var hashmapFilename = object.time + '_' + oid + '.json';
          kdbFS.storeJSONDoc(this.hashmapDirectory + path.sep + hashmapFilename, treeHash);
        }
        break;
      case 'tree':
        this.cacheTree(oid, object);
        kdbFS.storeJSONDoc(this.treeDirectory + path.sep + oid + '.json', object);
        break;
      case 'blob':
        object = this.convertBlob(object);
        this.cacheBlob(oid, object);
        if (object.binary) {
          kdbFS.storeBinaryFile(this.blobDirectory + path.sep + oid, object.binary);
        } else {
          kdbFS.storeJSONDoc(this.blobDirectory + path.sep + oid + '.json', object);
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
  updateCache() {
    let beforeTime = Date.now();

    var kdbCache = this;

    return nodegit.Repository.open(this.repoPath).then(function (repo) {
      return repo.getMasterCommit().then(function (masterCommit) {
        var revwalk = nodegit.Revwalk.create(repo);
        revwalk.sorting(nodegit.Revwalk.SORT.TIME);
        revwalk.push(masterCommit.id());
        // eslint-disable-next-line no-unused-vars
        return revwalk.getCommitsUntil(function (commit) {
          return true;
        }).then(function (commits) {
          return kdbCache.indexCommit(repo, commits);
        }).then(function () {
          let afterTime = Date.now();
          var deltaUpdateTime = afterTime-beforeTime;
          console.log('::: Update time for cached objects in ' + kdbCache.repoPath + ': ' + deltaUpdateTime/1000);
        });
      });
    });
  }


  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  indexCommit(repository, commits) {
    var kdbCache = this;
    var commit = commits.shift();

    // Exit recursion after all commits have been processed
    if(!commit){
      return;
    }

    if (this.getCommit(commit.id())){
      // console.log('::: Already indexed commit ' + commit.id());
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
  parseTree(repository, tree) {
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
        if (!this.getTree(entry.sha())){
          // jshint -W083
          promises.push(entry.getTree().then(function (t) {
            return kdbCache.parseTree(repository, t);
          }));
          // jshint +W083
        }
      } else {
        // Retrieve Blob if it is not already get
        var oid = entry.sha();
        if (!this.getBlob(oid)){
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
  getContents(repository, oid) {
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
