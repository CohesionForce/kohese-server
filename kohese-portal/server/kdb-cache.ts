/**
 *
 */

'use strict';
var path = require('path');
var kdbFS = require('./kdb-fs');

var nodegit = require('nodegit');

import { ItemProxy } from '../common/src/item-proxy';
import { TreeConfiguration } from '../common/src/tree-configuration';
import { LevelCache } from '../common/src/level-cache';
import * as LevelDown_Import from 'leveldown';


//
// Adjust for the differences in CommonJS and ES6
//
let LevelDown;
if (typeof(LevelDown_Import) === "object") {
  LevelDown = (<any>LevelDown_Import).default;
} else {
  LevelDown = LevelDown_Import;
}

var _ = require('underscore');

var jsonExt = /\.json$/;

const expandRepoCommits = true;

export class KDBCache extends LevelCache {

  public repoCommitMap;
  public repoTreeMap;
  public repoPath;
  public cacheDirectory;
  public dbDirectory;
  public objectDirectory;
  public repoCommitDirectory;
  public repoTreeDirectory;
  public blobDirectory;
  public blobMismatchDirectory;
  public refsDirectory;
  public tagDirectory;
  public kCommitDirectory;
  public kTreeDirectory;
  public expandedRepoCommitDirectory;
  public hashmapDirectory;

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  constructor(repoPath) {

    let cacheDirectory = path.join(repoPath, '.cache');
    let dbDirectory = path.join(cacheDirectory, 'cacheDB');
    let levelDown = LevelDown(dbDirectory);
    super(levelDown);

    this.repoCommitMap = new Map<string, any>();
    this.repoTreeMap = new Map<string, any>();

    this.registerSublevel(
      'rCommit',
      this.getRepoCommits,
      this.cacheRepoCommit,
      this.getRepoCommit
    );

    this.registerSublevel(
      'rTree',
      this.getRepoTrees,
      this.cacheRepoTree,
      this.getRepoTree
    );

    this.repoPath = repoPath;
    console.log('::: Loading Cache for ' + repoPath);

    this.cacheDirectory = cacheDirectory;
    this.dbDirectory = dbDirectory;
    this.objectDirectory = path.join(this.cacheDirectory, 'objects');
    this.repoCommitDirectory = path.join(this.objectDirectory, 'repoCommit');
    this.repoTreeDirectory = path.join(this.objectDirectory, 'repoTree');
    this.blobDirectory = path.join(this.objectDirectory, 'blob');
    this.blobMismatchDirectory = path.join(this.objectDirectory, 'mismatch_blob');
    this.refsDirectory = path.join(this.objectDirectory, 'refs');
    this.tagDirectory = path.join(this.objectDirectory, 'tag');
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
    kdbFS.createDirIfMissing(this.refsDirectory);
    kdbFS.createDirIfMissing(this.tagDirectory);
    kdbFS.createDirIfMissing(this.kCommitDirectory);
    kdbFS.createDirIfMissing(this.kTreeDirectory);
    kdbFS.createDirIfMissing(this.expandedRepoCommitDirectory);
    kdbFS.createDirIfMissing(this.hashmapDirectory);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getRepoCommits(){
    return this.repoCommitMap;
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
  getRepoTrees(){
    return this.repoTreeMap;
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

      // Strip stored null values
      for (let key in blobObject){
        if (blobObject[key] === null){
          delete blobObject[key];
        }
      }
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
  async loadCachedObjects() {

    await super.loadCachedObjects();
    let headRef = kdbFS.loadJSONDoc(this.refsDirectory + '/' + 'HEAD.json');
    let headCommit = this.getRef('HEAD');

    let storeCacheToLevel : boolean = false;

    if (headRef !== headCommit){
      console.log('::: Need to load and store local disk cache');

      console.log('::: Loading cached objects from directory');
      var oidFiles = kdbFS.getRepositoryFileList(this.blobDirectory);

      oidFiles.forEach((oidFile) => {
        var oid = oidFile.replace(jsonExt, '');
        try {
          if (oid === oidFile){
            var object = kdbFS.loadBinaryFile(this.blobDirectory + '/' + oidFile);
            var blob = this.convertBlob(object);
            this.cacheBlob(oid, blob);
          } else {
            var object = kdbFS.loadJSONDoc(this.blobDirectory + '/' + oidFile);
            this.cacheBlob(oid, object);
          }
        } catch (err) {
          console.log('*** Could not load cached blob:  ' + oid);
          console.log(err);
        }
      });

      // Load any blobs that have alternate representations
      oidFiles = kdbFS.getRepositoryFileList(this.blobMismatchDirectory);

      oidFiles.forEach((oidFile) => {
        var oid = oidFile.replace(jsonExt, '');
        try {
          if (oid === oidFile){
            var object = kdbFS.loadBinaryFile(this.blobMismatchDirectory + '/' + oidFile);
            var blob = this.convertBlob(object);
            this.cacheBlob(oid, blob);
          } else {
            var object = kdbFS.loadJSONDoc(this.blobMismatchDirectory + '/' + oidFile);
            this.cacheBlob(oid, object);
          }
        } catch (err) {
          console.log('*** Could not load cached mismatched blob:  ' + oid);
          console.log(err);
        }
      });
      console.log('::: Found ' + this.numberOfBlobs() + ' blobs');

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

      oidFiles = kdbFS.getRepositoryFileList(this.tagDirectory, jsonExt);
      oidFiles.forEach((oidFile) => {
        var oid = oidFile.replace(jsonExt, '');
        var object = kdbFS.loadJSONDoc(this.tagDirectory + '/' + oidFile);
        this.cacheTag(oid, object);
      });
      console.log('::: Found ' + this.numberOfTags() + ' tags');

      oidFiles = kdbFS.getRepositoryFileList(this.refsDirectory, jsonExt);
      oidFiles.forEach((oidFile) => {
        var oid = oidFile.replace(jsonExt, '');
        var object = kdbFS.loadJSONDoc(this.refsDirectory + '/' + oidFile);
        this.cacheRef(oid, object);
      });
      console.log('::: Found ' + this.numberOfRefs() + ' refs');

      console.log('::: Storing cache data to level repository');
      await this.saveSublevel('kCommit');
      await this.saveSublevel('kTree');
      await this.saveSublevel('blob');
      await this.saveSublevel('tag');
      await this.saveSublevel('rCommit');
      await this.saveSublevel('rTree');
      await this.saveSublevel('ref');
      console.log('::: Finished storing cache data to level repository');
    } else {
      console.log('::: Found ' + this.numberOfBlobs() + ' blobs');
      console.log('::: Found ' + this.numberOfRepoTrees() + ' repo trees');
      console.log('::: Found ' + this.numberOfRepoCommits() + ' repo commits');
      console.log('::: Found ' + this.numberOfTrees() + ' kTrees');
      console.log('::: Found ' + this.numberOfCommits() + ' kCommits');
      console.log('::: Found ' + this.numberOfTags() + ' tags');
      console.log('::: Found ' + this.numberOfRefs() + ' refs');
    }
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
        let treeConfig = new TreeConfiguration(oid);
        this.loadProxiesForRepoCommit(oid, treeConfig);
        treeConfig.loadingComplete();
        var treeHash = treeConfig.getAllTreeHashes();
        var hashmapFilename = object.time + '_' + oid + '.json';
        kdbFS.storeJSONDoc(this.hashmapDirectory + path.sep + hashmapFilename, treeHash);

        // Store kTrees
        let repoProxy = treeConfig.getRootProxy();
        repoProxy.visitTree(null,(proxy) => {
          let treeHashEntry = proxy.treeHashEntry;

          if(!this.getTree(treeHashEntry.treeHash)){
            this.cacheTree(treeHashEntry.treeHash, treeHashEntry);
            kdbFS.storeJSONDoc(this.kTreeDirectory + path.sep + treeHashEntry.treeHash + '.json', treeHashEntry);
          }

          if(!this.getBlob(treeHashEntry.oid)){
            console.log('$$$ Mismatch oid for item id: ' + proxy.item.id + '  (oid not found in cache): ' + treeHashEntry.oid);
            this.cacheBlob(treeHashEntry.oid, proxy.item);
            kdbFS.storeJSONDoc(this.blobMismatchDirectory + path.sep + treeHashEntry.oid + '.json', proxy.cloneItemAndStripDerived());
          }
        });

        // Store kCommits
        let kCommit = JSON.parse(JSON.stringify(object));
        delete kCommit.treeId;
        kCommit.repoTreeRoots = treeConfig.getRepoTreeHashes();
        this.cacheCommit(oid, kCommit);
        kdbFS.storeJSONDoc(this.kCommitDirectory + path.sep + oid + '.json', kCommit);

        treeConfig.deleteConfig();

        break;
      case 'repoTree':
        this.cacheRepoTree(oid, object);
        kdbFS.storeJSONDoc(this.repoTreeDirectory + path.sep + oid + '.json', object);
        break;
      case 'blob':
        let convertedBlob = this.convertBlob(object);
        let koid = ItemProxy.gitDocumentOID(convertedBlob);
        if (koid !== oid){
          console.log('$$$ Mismatch oid:' + koid + ' = ' + oid);
          if (convertedBlob.binary) {
            kdbFS.storeBinaryFile(this.blobMismatchDirectory + path.sep + koid, convertedBlob.binary);
          } else {
            kdbFS.storeJSONDoc(this.blobMismatchDirectory + path.sep + koid + '.json', convertedBlob);
          }
        }
        this.cacheBlob(oid, convertedBlob);
        if (convertedBlob.binary) {
          kdbFS.storeBinaryFile(this.blobDirectory + path.sep + oid, convertedBlob.binary);
        } else {
          kdbFS.storeBinaryFile(this.blobDirectory + path.sep + oid + '.json', object);
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
  async updateCache() {
    // Load Cached Objects From Prior Runs
    var beforeTime = Date.now();

    console.log('@@@ Loading HEAD');
    let headTest1 = this.retrieveValue('ref', 'HEAD');
    console.log('@@@ HEAD: 1 - ' + headTest1);
    console.log(headTest1 instanceof Promise);
    let headTest2 = await headTest1;
    console.log('@@@ HEAD: 2 - ' + headTest2);
    console.log(headTest2 instanceof Promise);
    let headTest3 = await headTest2;
    console.log('@@@ HEAD: 3 - ' + headTest3);
    console.log(headTest3 instanceof Promise);

    await this.loadCachedObjects();
    var afterTime = Date.now();
    var deltaLoadTime = afterTime-beforeTime;
    console.log('::: Load time for cached objects in ' + this.repoPath + ': ' + deltaLoadTime/1000);

    beforeTime = Date.now();

    var kdbCache = this;

    return nodegit.Repository.open(this.repoPath).then(function (repo) {
      return repo.getMasterCommit().then(function (masterCommit) {
        var revwalk = nodegit.Revwalk.create(repo);
        revwalk.sorting(nodegit.Revwalk.SORT.TIME);

        let masterCommitId = masterCommit.id();
        revwalk.push(masterCommitId);
        let refHEAD = masterCommitId.tostrS();

        // eslint-disable-next-line no-unused-vars
        return revwalk.getCommitsUntil(function (commit) {
          return true;
        }).then(function (commits) {
          return kdbCache.indexCommit(repo, commits);
        }).then(function () {
          try {
            kdbCache.cacheRef('HEAD', refHEAD);
            kdbFS.storeJSONDoc(kdbCache.refsDirectory + '/HEAD.json', refHEAD);
          } catch (err) {
            console.log('*** Error while writing HEAD reference');
            console.log(err);
          }

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
        // Retrieve Blob if it is not already cached
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
      console.log('*** Error retreiving blob from underlying repo: ' + oid);
      console.log(err.stack);
      kdbCache.addCachedObject('blob', oid, {
        error: "Can Not Retrieve Item From Underlying Repo",
        oid: oid
      });
      return Promise.resolve(oid);
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
  loadProxiesForRepoCommit(commitId, treeConfig){
    var commit = this.expandRepoCommit(commitId);
    this.loadProxiesForRepoRootDir(commit.tree, treeConfig);
    treeConfig.loadingComplete();
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  loadProxiesForRepoRootDir(treeData, treeConfig){
    var contents = treeData.contents;

    if (!contents) {
      console.log('*** Contents not found for directory.  Examine previous errors');
      return;
    }

    if (contents.hasOwnProperty('store')) {
      console.log('::: Found store dir for ' + treeData.oid);
    }

    if (contents.hasOwnProperty('export')) {
      console.log('::: Found early legacy dir (v0.1) for ' + treeData.oid);
      this.loadProxiesForRepoRootDir(contents['export'], treeConfig);
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
            this.loadProxiesForRepoContents(contents.Repository.contents, treeConfig);
            break;
          default:
            this.loadProxiesForKindContents(kind, contents[kind].contents, treeConfig);
        }

      }

    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  loadProxiesForRepoContents(repoDir, treeConfig){
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
      var proxy = new ItemProxy('Repository', item, treeConfig);

      // TODO Need to handle mount files

      var repoSubdir = repoDir[item.id];
      if(repoSubdir){
        this.loadProxiesForRepoRootDir(repoSubdir, treeConfig);
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  loadProxiesForKindContents(kind, kindDir, treeConfig){
    console.log('::: Processing ' + kind);
    for(var kindFile in kindDir){

      if (!jsonExt.test(kindFile)){
        continue;
      }

      var oid = kindDir[kindFile].oid;

      var item = this.getBlob(oid);

      var proxy = new ItemProxy(kind, item, treeConfig);
      let koid = proxy.oid;
      if (koid !== oid){
        let mismatchedBlob = this.getBlob(koid);
        if (!mismatchedBlob){
          // Need to store the mismatched blob so it can be retrieved
          console.log('!!! Detected oid mismatch: ' + koid + ' = ' + oid);
          let updatedItem = proxy.cloneItemAndStripDerived();
          this.cacheBlob(koid, updatedItem);
          kdbFS.storeJSONDoc(this.blobMismatchDirectory + '/' + koid + '.json', updatedItem);
        }
      }

    }

  }

}
