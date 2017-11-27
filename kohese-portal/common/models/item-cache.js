/**
 * 
 */

'use strict';

var _ = require('underscore');
var ItemProxy = require('./item-proxy.js');

var repoObjects = {
    commit: {},
    tree: {},
    blob: {}
  };

var repoBlob = repoObjects.blob;
var repoTree = repoObjects.tree;
var repoCommit = repoObjects.commit;

var jsonExt = /\.json$/;

const disableObjectFreeze = true;  // TODO set back to false

class ItemCache {
  constructor() {
    throw 'Invalid_Class';
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
  static cacheCommit(oid, commit){
    Object.freeze(commit);
    repoCommit[oid] = commit;
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
  static cacheTree(oid, tree){
    Object.freeze(tree);
    repoTree[oid] = tree;
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
  static cacheBlob(oid, blob){
    if(!disableObjectFreeze){
      Object.freeze(blob);
    }          
    repoBlob[oid] = blob;
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
  static numberOfCommits(){
    return _.size(repoObjects.commit);
  }
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static numberOfTrees(){
    return _.size(repoObjects.tree);
  }
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static numberOfBlobs(){
    return _.size(repoObjects.blob);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static expandCommit(oid){
    var commitData = this.cachedCommit(oid);

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
  //////////////////////////////////////////////////////////////////////////
  //// Proxy loading methods
  //////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////
  
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
      if(repoSubdir){
        this.loadProxiesForRepo(repoSubdir);        
      }
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

module.exports = ItemCache;

