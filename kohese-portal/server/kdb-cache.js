/**
 * 
 */

'use strict';
var _ = require('underscore');
var path = require('path');
var fs = require('fs');
var kdbFS = require('./kdb-fs.js');

var nodegit = require('nodegit');

const ItemProxy = require('../common/models/item-proxy.js');

const CACHE_DIRECTORY = path.join('kdb', 'cache');
const OBJECT_DIRECTORY = path.join(CACHE_DIRECTORY, 'git-object');
const COMMIT_DIRECTORY = path.join(OBJECT_DIRECTORY, 'commit');
const EXPAND_COMMIT_DIRECTORY = path.join(OBJECT_DIRECTORY, 'expand-commit');
const BLOB_DIRECTORY = path.join(OBJECT_DIRECTORY, 'blob');
const BLOB_MISMATCH_DIRECTORY = path.join(OBJECT_DIRECTORY, 'mismatch_blob');
const TREE_DIRECTORY = path.join(OBJECT_DIRECTORY, 'tree');

var jsonExt = /\.json$/;

var repoObjects = {
    blob: {},
    tree: {},
    commit: {}
  };

var repoBlob = repoObjects.blob;
var repoTree = repoObjects.tree;
var repoCommit = repoObjects.commit;

const compareOIDs = false;
const expandCommits = true;

class KDBCache {

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  constructor(repoPath) {
    this.repoPath = repoPath;
    
    this.loadCachedObjects();
    
    // Then check index for new commits
    
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static getCommits(){
    return repoCommit;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static cachedCommit(oid){
    return repoCommit[oid];
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static cachedTree(oid){
    return repoTree[oid];
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static cachedBlob(oid){
    return repoBlob[oid];
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
    kdbFS.createDirIfMissing(BLOB_DIRECTORY);
    kdbFS.createDirIfMissing(BLOB_MISMATCH_DIRECTORY);
    kdbFS.createDirIfMissing(TREE_DIRECTORY);

    console.log('::: Loading cached objects');
    var oidFiles = kdbFS.getRepositoryFileList(BLOB_DIRECTORY);

    var parseMismatch = 0;
    oidFiles.forEach((oidFile) => {
      var oid = oidFile.replace(/\.json$/, '');
      try {
        var object = kdbFS.loadBinaryFile(BLOB_DIRECTORY + '/' + oidFile);
        var blob = this.convertBlob(object);
        Object.freeze(blob);

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
        repoObjects.blob[oid] = blob;
      } catch (err) {
        console.log('*** Could not load cached blob:  ' + oid);
        console.log(err);
      }
    });
    console.log('::: Found ' + _.size(repoObjects.blob) + ' blobs');
    if(parseMismatch){
      console.log('::: Found ' + parseMismatch + ' parse mismatches');      
    }
    
    oidFiles = kdbFS.getRepositoryFileList(TREE_DIRECTORY, /\.json$/);
    oidFiles.forEach((oidFile) => {
      var oid = oidFile.replace(/\.json$/, '');
      var object = kdbFS.loadJSONDoc(TREE_DIRECTORY + '/' + oidFile);
      Object.freeze(object);
      repoObjects.tree[oid] = object;
    });
    console.log('::: Found ' + _.size(repoObjects.tree) + ' trees');
    
    oidFiles = kdbFS.getRepositoryFileList(COMMIT_DIRECTORY, /\.json$/);
    oidFiles.forEach((oidFile) => {
      var oid = oidFile.replace(/\.json$/, '');
      var object = kdbFS.loadJSONDoc(COMMIT_DIRECTORY + '/' + oidFile);
      Object.freeze(object);
      repoObjects.commit[oid] = object;
    });
    console.log('::: Found ' + _.size(repoObjects.commit) + ' commits');
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static addCachedObject(type, oid, object) {
    
    if (type === 'blob'){
      object = this.convertBlob(object);
    }

    Object.freeze(object);
    repoObjects[type][oid] = object;
    
    switch (type) {
      case 'commit':
        kdbFS.storeJSONDoc(COMMIT_DIRECTORY + path.sep + oid + '.json', object);
        
        if (expandCommits){
          var expandedCommitFilename = object.time + '_' + oid + '.json';
          kdbFS.storeJSONDoc(EXPAND_COMMIT_DIRECTORY + path.sep + expandedCommitFilename, this.expandCommit(oid));
        }
        break;
      case 'tree':
        kdbFS.storeJSONDoc(TREE_DIRECTORY + path.sep + oid + '.json', object);    
        break;
      case 'blob':
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
  //
  //////////////////////////////////////////////////////////////////////////
  static expandCommit(oid){
    var commitData = repoCommit[oid];

    var newCommitData = {
        meta: _.clone(commitData),
        tree: {}
    };
    
    delete newCommitData.meta.treeId;
    newCommitData.tree = this.expandTree(commitData.treeId);

    return newCommitData;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static expandTree(treeId) {
    var treeData = {
        oid: treeId,
        contents: {}
    };
    
    var treeEntry = this.cachedTree(treeId);

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
          contents[entryName] = this.expandTree(entry.oid);
          break;
        default:
          console.log('*** Error: Unexpected Kind ' + entry.kind + ' in tree: ' + treeId);
      }
    }
    
    return treeData;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static loadProxiesForCommit(commitId){
    var commit = this.expandCommit(commitId);
    this.loadProxiesForRepo(commit.tree);
    ItemProxy.loadingComplete();
  }
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static loadProxiesForRepo(treeData){
    var contents = treeData.contents;

    if(contents.hasOwnProperty('store')) {
      console.log('::: Found store dir for ' + treeData.oid);
    }
    
    if (contents.hasOwnProperty('export')) {
      console.log('::: Found early legacy dir (v0.1) for ' + treeData.oid);
      this.loadProxiesForRepo(contents['export']);
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
  static loadProxiesForRepoContents(repoDir){
    console.log('::: Processing Repositories');
    
    for(var repoFile in repoDir){
      
      if (!jsonExt.test(repoFile)){
        console.log('>>> Skipping repo file ' + repoFile);
        continue;
      }

      console.log('+++ Found Repository ' + repoFile);
      
      var oid = repoDir[repoFile].oid;

      var item = this.cachedBlob(oid);
      var proxy = new ItemProxy('Repository', item);
      
      // TODO Need to handle mount files
      
      var repoSubdir = repoDir[item.id];
      this.loadProxiesForRepo(repoSubdir);
    }
  }
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static loadProxiesForKindContents(kind, kindDir){
    console.log('::: Processing ' + kind);
    for(var kindFile in kindDir){
      
      if (!jsonExt.test(kindFile)){
        continue;
      }
      
      var oid = kindDir[kindFile].oid;

      var item = this.cachedBlob(oid);
      var proxy = new ItemProxy(kind, item);
      
    }
    
  }
  
}

module.exports = KDBCache;
