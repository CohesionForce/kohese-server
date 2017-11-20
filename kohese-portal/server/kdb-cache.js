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
const BLOB_DIRECTORY = path.join(OBJECT_DIRECTORY, 'blob');
const TREE_DIRECTORY = path.join(OBJECT_DIRECTORY, 'tree');

var repoObjects = {
    blob: {},
    tree: {},
    commit: {}
  };

var repoBlob = repoObjects.blob;
var repoTree = repoObjects.tree;
var repoCommit = repoObjects.commit;

const compareOIDs = false;

class KDBCache {

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  constructor() {
    kdbFS.createDirIfMissing(CACHE_DIRECTORY);
    kdbFS.createDirIfMissing(OBJECT_DIRECTORY);
    kdbFS.createDirIfMissing(COMMIT_DIRECTORY);
    kdbFS.createDirIfMissing(BLOB_DIRECTORY);
    kdbFS.createDirIfMissing(TREE_DIRECTORY);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static loadCachedObjects() {
    kdbFS.createDirIfMissing(CACHE_DIRECTORY);
    kdbFS.createDirIfMissing(OBJECT_DIRECTORY);
    kdbFS.createDirIfMissing(COMMIT_DIRECTORY);
    kdbFS.createDirIfMissing(BLOB_DIRECTORY);
    kdbFS.createDirIfMissing(TREE_DIRECTORY);

    console.log('::: Loading cached objects');
    var oidFiles = kdbFS.getRepositoryFileList(BLOB_DIRECTORY);

    oidFiles.forEach((oid) => {
      try {
        var object = kdbFS.loadBinaryFile(BLOB_DIRECTORY + '/' + oid);
        if (compareOIDs){
          var koid = ItemProxy.gitFileOID(object);
          if (oid !== koid){
            console.log('Mismatch for ' + oid + ' - ' + koid);        
          }          
        }
        repoObjects.blob[oid] = object;
      } catch (err) {
        console.log('*** Could not load cached blob:  ' + oid);
        console.log(err);
      }
    });
    console.log('::: Found ' + _.size(repoObjects.blob) + ' blobs');
    
    oidFiles = kdbFS.getRepositoryFileList(TREE_DIRECTORY, /\.json$/);
    oidFiles.forEach((oidFile) => {
      var oid = oidFile.replace(/\.json$/, '');
      var object = kdbFS.loadJSONDoc(TREE_DIRECTORY + '/' + oidFile);
      repoObjects.tree[oid] = object;
    });
    console.log('::: Found ' + _.size(repoObjects.tree) + ' trees');
    
    oidFiles = kdbFS.getRepositoryFileList(COMMIT_DIRECTORY, /\.json$/);
    oidFiles.forEach((oidFile) => {
      var oid = oidFile.replace(/\.json$/, '');
      var object = kdbFS.loadJSONDoc(COMMIT_DIRECTORY + '/' + oidFile);
      repoObjects.commit[oid] = object;
    });
    console.log('::: Found ' + _.size(repoObjects.commit) + ' commits');
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static addCachedObject(type, oid, object) {
    repoObjects[type][oid] = object;

    if(type === 'blob'){
      kdbFS.storeBinaryFile(OBJECT_DIRECTORY + '/' + type + path.sep + oid, object);
    } else {
      kdbFS.storeJSONDoc(OBJECT_DIRECTORY + '/' + type + path.sep + oid + '.json', object);    
    }
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

}

module.exports = KDBCache;
