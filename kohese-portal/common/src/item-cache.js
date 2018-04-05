/**
 *
 */

'use strict';

var _ = require('underscore');
var ItemProxy = require('./item-proxy.js');

var jsonExt = /\.json$/;

// TODO set back to false and/or remove disable check below
const disableObjectFreeze = false;

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
//
// The ItemCache is the super class that will support cache management on both the server and the client.
// The ItemCache will support retrieval of all historical data as well as the current working tree and
// staged content.
//
// ItemCache uses the Object.freeze capability to restrict the modification of any cached
// information.  Any attempt to modify cached data will result in an exception.  As the item
// class management capability is rolled out, there will be a way to perform a copy of the data
// prior to modification.
//
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

class ItemCache {
  constructor() {
   this.repoObjects = {
      commit: {},
      tree: {},
      blob: {}
    };

  this.repoBlob = this.repoObjects.blob;
  this.repoTree = this.repoObjects.tree;
  this.repoCommit = this.repoObjects.commit;

  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getObjectMap(){
    return this.repoObjects;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  setObjectMap(objectMap){
    this.repoObjects = objectMap;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getCommits(){
    return this.repoCommit;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cacheCommit(oid, commit){
    Object.freeze(commit);
    this.repoCommit[oid] = commit;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getCommit(oid){
    return this.repoCommit[oid];
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cacheTree(oid, tree){
    Object.freeze(tree);
    this.repoTree[oid] = tree;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getTree(oid){
    return this.repoTree[oid];
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cacheBlob(oid, blob){
    if(!disableObjectFreeze){
      Object.freeze(blob);
    }
    this.repoBlob[oid] = blob;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getBlob(oid){
    return this.repoBlob[oid];
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  numberOfCommits(){
    return _.size(this.repoObjects.commit);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  numberOfTrees(){
    return _.size(this.repoObjects.tree);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  numberOfBlobs(){
    return _.size(this.repoObjects.blob);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  expandCommit(oid){
    var commitData = this.getCommit(oid);

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
  expandTree(treeId) {
    var treeData = {
        oid: treeId,
        contents: {}
    };

    var treeEntry = this.getTree(treeId);

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
  //////////////////////////////////////////////////////////////////////////
  //// Proxy loading methods
  //////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  loadProxiesForCommit(commitId){
    var commit = this.expandCommit(commitId);
    this.loadProxiesForRepo(commit.tree);
    ItemProxy.loadingComplete();
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  loadProxiesForRepo(treeData){
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
        this.loadProxiesForRepo(repoSubdir);
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

module.exports = ItemCache;

