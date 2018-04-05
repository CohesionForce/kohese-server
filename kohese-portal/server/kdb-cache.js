/**
 *
 */

'use strict';
var path = require('path');
var kdbFS = require('./kdb-fs.js');

var nodegit = require('nodegit');

var ItemProxy = require('../common/src/item-proxy.js');
var ItemCache = require('../common/src/item-cache.js');

var _ = require('underscore');

var jsonExt = /\.json$/;

const compareOIDs = false;
const expandRepoCommits = true;

class KDBCache extends ItemCache {

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  constructor(repoPath) {

    super();

    this.repoCommitMap = {};
    this.repoTreeMap = {};

    this.repoPath = repoPath;
    console.log('::: Loading Cache for ' + repoPath);

    this.cacheDirectory = path.join(repoPath, '.cache');
    this.objectDirectory = path.join(this.cacheDirectory, 'objects');
    this.repoCommitDirectory = path.join(this.objectDirectory, 'repoCommit');
    this.repoTreeDirectory = path.join(this.objectDirectory, 'repoTree');
    this.blobDirectory = path.join(this.objectDirectory, 'blob');
    this.blobMismatchDirectory = path.join(this.objectDirectory, 'mismatch_blob');
    this.kCommitDirectory = path.join(this.objectDirectory, 'kCommit');
    this.kTreeDirectory = path.join(this.objectDirectory, 'kTree');
    this.expandedRepoCommitDirectory = path.join(this.cacheDirectory, 'expanded-repo-commit');
    this.hashmapDirectory = path.join(this.cacheDirectory, 'hashmap');

    kdbFS.createDirIfMissing(this.cacheDirectory);
    kdbFS.createGITIgnoreAllIfMissing(this.cacheDirectory + '/.gitignore');
    kdbFS.createDirIfMissing(this.objectDirectory);
    kdbFS.createDirIfMissing(this.repoCommitDirectory);
    kdbFS.createDirIfMissing(this.repoTreeDirectory);
    kdbFS.createDirIfMissing(this.blobDirectory);
    kdbFS.createDirIfMissing(this.blobMismatchDirectory);
    kdbFS.createDirIfMissing(this.kCommitDirectory);
    kdbFS.createDirIfMissing(this.kTreeDirectory);
    kdbFS.createDirIfMissing(this.expandedRepoCommitDirectory);
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
  cacheRepoCommit(oid, commit){
    Object.freeze(commit);
    this.repoCommitMap[oid] = commit;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getRepoCommit(oid){
    return this.repoCommitMap[oid];
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cacheRepoTree(oid, tree){
    Object.freeze(tree);
    this.repoTreeMap[oid] = tree;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getRepoTree(oid){
    return this.repoTreeMap[oid];
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  numberOfRepoCommits(){
    return _.size(this.repoCommitMap);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  numberOfRepoTrees(){
    return _.size(this.repoTreeMap);
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
      var oid = oidFile.replace(jsonExt, '');
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

    oidFiles = kdbFS.getRepositoryFileList(this.repoTreeDirectory, jsonExt);
    oidFiles.forEach((oidFile) => {
      var oid = oidFile.replace(jsonExt, '');
      var object = kdbFS.loadJSONDoc(this.repoTreeDirectory + '/' + oidFile);
      this.cacheRepoTree(oid, object);
    });
    console.log('::: Found ' + this.numberOfRepoTrees() + ' repo trees');

    oidFiles = kdbFS.getRepositoryFileList(this.repoCommitDirectory, jsonExt);
    oidFiles.forEach((oidFile) => {
      var oid = oidFile.replace(jsonExt, '');
      var object = kdbFS.loadJSONDoc(this.repoCommitDirectory + '/' + oidFile);
      this.cacheRepoCommit(oid, object);
    });
    console.log('::: Found ' + this.numberOfRepoCommits() + ' repo commits');

    oidFiles = kdbFS.getRepositoryFileList(this.kTreeDirectory, jsonExt);
    oidFiles.forEach((oidFile) => {
      var oid = oidFile.replace(jsonExt, '');
      var object = kdbFS.loadJSONDoc(this.kTreeDirectory + '/' + oidFile);
      this.cacheTree(oid, object);
    });
    console.log('::: Found ' + this.numberOfTrees() + ' kTrees');

    oidFiles = kdbFS.getRepositoryFileList(this.kCommitDirectory, jsonExt);
    oidFiles.forEach((oidFile) => {
      var oid = oidFile.replace(jsonExt, '');
      var object = kdbFS.loadJSONDoc(this.kCommitDirectory + '/' + oidFile);
      this.cacheCommit(oid, object);
    });
    console.log('::: Found ' + this.numberOfCommits() + ' kCommits');
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  addCachedObject(type, oid, object) {

    switch (type) {
      case 'repoCommit':
        this.cacheRepoCommit(oid, object);
        kdbFS.storeJSONDoc(this.repoCommitDirectory + path.sep + oid + '.json', object);

        if (expandRepoCommits){
          var expandedCommitFilename = object.time + '_' + oid + '.json';
          kdbFS.storeJSONDoc(this.expandedRepoCommitDirectory + path.sep + expandedCommitFilename, this.expandRepoCommit(oid));
        }

        // Store HashMap
        let skipModels = true;
        ItemProxy.resetItemRepository(skipModels);
        this.loadProxiesForRepoCommit(oid);
        var treeHash = ItemProxy.getAllTreeHashes();
        var hashmapFilename = object.time + '_' + oid + '.json';
        kdbFS.storeJSONDoc(this.hashmapDirectory + path.sep + hashmapFilename, treeHash);

        // Store kTrees
        let repoProxy = ItemProxy.getRootProxy();
        repoProxy.visitTree(null,(proxy) => {
          let treeHashEntry = proxy.treeHashEntry;

          if(!this.getTree(treeHashEntry.treeHash)){
            this.cacheCommit(treeHashEntry.treeHash, treeHashEntry);
            kdbFS.storeJSONDoc(this.kTreeDirectory + path.sep + treeHashEntry.treeHash + '.json', treeHashEntry);
          }
        });

        // Store kCommits
        let kCommit = JSON.parse(JSON.stringify(object));
        delete kCommit.treeId;
        kCommit.repoTreeRoots = ItemProxy.getRepoTreeHashes();
        kdbFS.storeJSONDoc(this.kCommitDirectory + path.sep + oid + '.json', kCommit);

        break;
      case 'repoTree':
        this.cacheRepoTree(oid, object);
        kdbFS.storeJSONDoc(this.repoTreeDirectory + path.sep + oid + '.json', object);
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

    if (this.getRepoCommit(commit.id())){
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

        kdbCache.addCachedObject('repoCommit', commit.id(), co);

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
        if (!this.getRepoTree(entry.sha())){
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

    this.addCachedObject('repoTree', tree.id(), entries);

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

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  expandRepoCommit(oid){
    var commitData = this.getRepoCommit(oid);

    var newCommitData = {
        meta: _.clone(commitData),
        tree: {}
    };

    delete newCommitData.meta.treeId;
    newCommitData.tree = this.expandRepoTree(commitData.treeId);

    return newCommitData;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  expandRepoTree(treeId) {
    var treeData = {
        oid: treeId,
        contents: {}
    };

    var treeEntry = this.getRepoTree(treeId);

    if (!treeEntry){
      console.log('*** Can\'t find cached tree: ' + treeId);
    }

    var contents = treeData.contents;

    for(var entryName in treeEntry){
      var entry = treeEntry[entryName];
      switch (entry.type) {
        case 'blob':
          contents[entryName] = {
            oid: entry.oid
          };
          break;
        case 'tree':
          contents[entryName] = this.expandRepoTree(entry.oid);
          break;
        default:
          console.log('*** Error: Unexpected Kind ' + entry.kind + ' in tree: ' + treeId);
      }
    }

    return treeData;
  }

  //////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////
  //// Proxy loading methods
  //////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  loadProxiesForRepoCommit(commitId){
    var commit = this.expandRepoCommit(commitId);
    this.loadProxiesForRepoRootDir(commit.tree);
    ItemProxy.loadingComplete();
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  loadProxiesForRepoRootDir(treeData){
    var contents = treeData.contents;

    if(contents.hasOwnProperty('store')) {
      console.log('::: Found store dir for ' + treeData.oid);
    }

    if (contents.hasOwnProperty('export')) {
      console.log('::: Found early legacy dir (v0.1) for ' + treeData.oid);
      this.loadProxiesForRepoRootDir(contents['export']);
      return;
    }

    if (contents.hasOwnProperty('Item')){
      console.log('::: Found legacy dir (v0.2) for ' + treeData.oid);

      for(var kind in contents){
        switch (kind) {
          case '.gitignore':
          case '.project':
          case 'Analysis':
            console.log('--- Skipping ' + kind);
            break;
          case 'Repository':
            this.loadProxiesForRepoContents(contents.Repository.contents);
            break;
          default:
            this.loadProxiesForKindContents(kind, contents[kind].contents);
        }

      }

    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  loadProxiesForRepoContents(repoDir){
    console.log('::: Processing Repositories');

    for(var repoFile in repoDir){

      if (!jsonExt.test(repoFile)){
        console.log('>>> Skipping repo file ' + repoFile);
        continue;
      }

      console.log('+++ Found Repository ' + repoFile);

      var oid = repoDir[repoFile].oid;

      var item = this.getBlob(oid);
      // eslint-disable-next-line no-unused-vars
      var proxy = new ItemProxy('Repository', item);

      // TODO Need to handle mount files

      var repoSubdir = repoDir[item.id];
      if(repoSubdir){
        this.loadProxiesForRepoRootDir(repoSubdir);
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  loadProxiesForKindContents(kind, kindDir){
    console.log('::: Processing ' + kind);
    for(var kindFile in kindDir){

      if (!jsonExt.test(kindFile)){
        continue;
      }

      var oid = kindDir[kindFile].oid;

      var item = this.getBlob(oid);
      // eslint-disable-next-line no-unused-vars
      var proxy = new ItemProxy(kind, item);

    }

  }

}

module.exports = KDBCache;
