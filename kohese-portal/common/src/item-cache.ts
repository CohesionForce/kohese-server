/**
 *
 */

'use strict';

import * as   _ from 'underscore';
import { ItemProxy } from './item-proxy';
import { TreeHashEntry, TreeHashMap, TreeHashValueType } from './tree-hash';


// TODO set back to false and/or remove disable check below
const disableObjectFreeze = false;
const chunkSize : number = 1000;

export class KoheseCommit {
  time: number;
  author: string;
  message: string;
  parents?: Array<string>;
  repoTreeRoots: { [ key : string ] : TreeHashEntry };
}

type KoheseTree = TreeHashEntry;

type Blob = any;

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

export class ItemCache {
  private metadata : {
    numRefs: number,
    numTags: number,
    numCommits: number,
    numTrees: number,
    numBlobs: number
  }
  private refs;
  private tags;
  private kCommitMap : { [ oid : string ]: KoheseCommit};
  private kTreeMap : { [ oid : string ]: KoheseTree};
  private blobMap : { [ oid : string ]: Blob};

  private objectMap;

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  constructor() {

    this.metadata = {
      numRefs: 0,
      numTags: 0,
      numCommits: 0,
      numTrees: 0,
      numBlobs: 0,
    }
    this.refs = {};
    this.tags = {};
    this.kCommitMap = {};
    this.kTreeMap = {};
    this.blobMap = {};

  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  splitObject (object) {
    let numKeys = _.size(object);
    let numChunks = Math.ceil(numKeys/chunkSize);

    console.log('::: Splitting Object with ' + numKeys + ' keys into ' + numChunks + ' chunks...');
    let sObject = { 0 : {}};
    let chunkIdx = 0;
    let keyIndex = 0;
    for (let key in object){
      sObject[chunkIdx][key] = object[key];
      keyIndex++;
      if ((keyIndex % chunkSize) === 0) {
        chunkIdx++;
        sObject[chunkIdx] = {};
      }
    }

    return sObject;
  }


  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getObjectMap(){
    if (!this.objectMap){
      this.objectMap = {
        metadata : {
          numRefs: _.size(this.refs),
          numTags: _.size(this.tags),
          numCommits: _.size(this.kCommitMap),
          numTrees: _.size(this.kTreeMap),
          numBlobs: _.size(this.blobMap)
        },
        refs : this.refs,
        tags : this.tags,
        kCommitMap : this.kCommitMap,
        kTreeMapChunks: this.splitObject(this.kTreeMap),
        blobMapChunks: this.splitObject(this.blobMap)
      }
    }
    return this.objectMap;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  setObjectMap(objectMap){
    let metadata = objectMap.metadata;

    if (objectMap.refs){
      this.refs = objectMap.refs;
      this.metadata.numRefs = _.size(this.refs);
      if(objectMap.metadata && this.metadata.numRefs !== objectMap.metadata.numRefs){
        console.log('*** Number of refs do not match: ' + _.size(this.refs));
      }
    }

    if (objectMap.tags){
      this.tags = objectMap.tags;
      this.metadata.numTags = _.size(this.tags);
      if(this.metadata.numTags !== objectMap.metadata.numTags){
        console.log('*** Number of tags do not match: ' + _.size(this.tags));
      }
    }

    if (objectMap.kCommitMap){
      this.kCommitMap = objectMap.kCommitMap;
      this.metadata.numCommits = _.size(this.kCommitMap);
      if(this.metadata.numCommits !== objectMap.metadata.numCommits){
        console.log('*** Number of commits do not match: ' + _.size(this.kCommitMap));
      }
    }

    if (objectMap.kTreeMap){
      this.kTreeMap = objectMap.kTreeMap;
      this.metadata.numTrees = _.size(this.kTreeMap);
      if(this.metadata.numTrees !== objectMap.metadata.numTrees){
        console.log('*** Number of trees do not match: ' + _.size(this.kTreeMap));
      }
    }

    if (objectMap.blobMap){
      this.blobMap = objectMap.blobMap;
      this.metadata.numBlobs = _.size(this.blobMap);
      if(this.metadata.numBlobs !== objectMap.metadata.numBlobs){
        console.log('*** Number of blobs do not match: ' + _.size(this.blobMap));
      }
    }

    if (!_.isEqual(this.metadata, objectMap.metadata)){
      console.log('*** Cache metadata does not match: ');
      console.log('*** Server Cache Metadata:')
      console.log(objectMap.metadata);
      console.log('*** Client Cache Metadata:')
      console.log(this.metadata);
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getRefs(){
    return this.refs;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cacheRef(ref, oid){
    this.refs[ref] = oid;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getRef(ref){
    return this.refs[ref];
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getTags(){
    return this.tags;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cacheTag(tag, oid){
    this.tags[tag] = oid;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getTag(tag){
    return this.tags[tag];
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getCommits(){
    return this.kCommitMap;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cacheCommit(oid : string, commit : KoheseCommit){
    Object.freeze(commit);
    this.kCommitMap[oid] = commit;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getCommit(oid : string){
    return this.kCommitMap[oid];
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getTrees(){
    return this.kTreeMap;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cacheTree(oid, tree){
    Object.freeze(tree);
    this.kTreeMap[oid] = tree;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getTreeHashMap(forCommit : string) : TreeHashMap {
    var treeHashMap = {};

    let commit = this.getCommit(forCommit);

    let treeHashEntryStack : Array<{id:string, treeId:TreeHashValueType}> = [];
    let reversedRootIds = Object.keys(commit.repoTreeRoots).reverse();
    for (let repoIdx in reversedRootIds){
      let repoId = reversedRootIds[repoIdx];
      treeHashEntryStack.push({id:repoId, treeId:commit.repoTreeRoots[repoId].treeHash});
    }

    while (treeHashEntryStack.length > 0) {
      let mapEntry = treeHashEntryStack.pop();
      let treeHashEntry = this.getTree(mapEntry.treeId)

      if (treeHashEntry) {
        treeHashMap [mapEntry.id] = treeHashEntry;

        let reversedChildIds = Object.keys(treeHashEntry.childTreeHashes).reverse();
        for (let childIdx in reversedChildIds){
          let childId = reversedChildIds[childIdx];
          let treeId = treeHashEntry.childTreeHashes[childId];
          switch (treeId){
            case "Repository-Mount":
            case "Internal":
              // Ignore
              break;
            default:
              treeHashEntryStack.push({id:childId, treeId: treeId});
          }
        }
      } else {
        console.log('!!! Can not find treeHashEntry for: ' + JSON.stringify(mapEntry));
      }
    }

    return treeHashMap;
  }



  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getTree(oid){
    return this.kTreeMap[oid];
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cacheBlob(oid, blob){
    if(!disableObjectFreeze){
      Object.freeze(blob);
    }
    this.blobMap[oid] = blob;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getBlob(oid){
    return this.blobMap[oid];
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  numberOfCommits(){
    return _.size(this.kCommitMap);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  numberOfTrees(){
    return _.size(this.kTreeMap);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  numberOfBlobs(){
    return _.size(this.blobMap);
  }

  //////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////
  //// Cache analysis methods
  //////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  detectMissingCommitData(selectedCommitId?) {

    let cache = this;
    let blobEvaluated = {};
    let treeEvaluated = {};

    function evaluateBlob (itemId, kind, oid) {
      if (!blobEvaluated[oid]){
        // console.log('::: Evaluating blob for ' + itemId);
        if (!cache.getBlob(oid)){
          console.log('*** Missing blob for tree (%s) of kind (%s) with oid (%s)', itemId, kind, oid);
        }
        blobEvaluated[oid] = true;
      }
    }

    function evaluateTreeEntry (itemId, tree) {
      if (!treeEvaluated[tree.treeHash]){
        // console.log('::: Evaluating tree for ' + itemId);
        evaluateBlob(itemId, tree.kind, tree.oid);
        for (let childId in tree.childTreeHashes) {
          let childTreeHash = tree.childTreeHashes[childId];
          switch (childTreeHash){
            case 'Repository-Mount':
            case 'Internal':
              break;
            default:
              let childTree = cache.getTree(childTreeHash);
              if (childTree) {
                evaluateTreeEntry(childId, childTree);
              } else {
                console.log('*** Missing tree for tree (%s) with treeHash (%s)', childId, childTreeHash);
              }
          }
        }
        treeEvaluated[tree.treeHash] = true;
      }
    }

    for (let commitId in this.kCommitMap) {
      if (!selectedCommitId || (selectedCommitId && (commitId === selectedCommitId))){
        let commit = this.kCommitMap[commitId];
        console.log('::: Evaluating commit:  ' + commitId);
        // console.log(JSON.stringify(commit, null, '  '));

        for (let rootId in commit.repoTreeRoots){
          let root = commit.repoTreeRoots[rootId];
          // console.log('::: Evaluating root:  ' + rootId);
          evaluateTreeEntry(rootId, root);
        }
      }
    };
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  detectMissingTreeData(selectedTreeId?) {

    let cache = this;
    let blobEvaluated = {};
    let treeEvaluated = {};

    function evaluateBlob (itemId, kind, oid) {
      if (!blobEvaluated[oid]){
        // console.log('::: Evaluating blob for ' + itemId);
        if (!cache.getBlob(oid)){
          console.log('*** Missing blob for tree (%s) of kind (%s) with oid (%s)', itemId, kind, oid);
        }
        blobEvaluated[oid] = true;
      }
    }

    function evaluateTreeEntry (itemId, tree) {
      if (!treeEvaluated[tree.treeHash]){
        // console.log('::: Evaluating tree for ' + itemId);
        evaluateBlob(itemId, tree.kind, tree.oid);
        for (let childId in tree.childTreeHashes) {
          let childTreeHash = tree.childTreeHashes[childId];
          switch (childTreeHash){
            case 'Repository-Mount':
            case 'Internal':
              break;
            default:
              let childTree = cache.getTree(childTreeHash);
              if (childTree) {
                evaluateTreeEntry(childId, childTree);
              } else {
                console.log('*** Missing tree for tree (%s) with treeHash (%s)', childId, childTreeHash);
              }
          }
        }
        treeEvaluated[tree.treeHash] = true;
      }
    }

    for (let treeId in this.kTreeMap) {
      if (!selectedTreeId || (selectedTreeId && (treeId === selectedTreeId))){
        let tree = this.kTreeMap[treeId];
        console.log('::: Evaluating tree:  ' + treeId);
        // console.log(JSON.stringify(commit, null, '  '));

        evaluateTreeEntry(treeId, tree);
      }
    };
  }

  //////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////
  //// Proxy loading methods
  //////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  loadProxiesForCommit(commitId, treeConfig){
    let commit = this.getCommit(commitId);

    console.log('$$$ Loading commit: ');
    console.log(JSON.stringify(commit, [ 'time', 'author', 'message', 'parents' ], '  '));

    for(let repoId in commit.repoTreeRoots){
      let repoTreeHashEntry = commit.repoTreeRoots[repoId];
      this.loadProxiesForTree(repoId, repoTreeHashEntry, treeConfig);
    }

    console.log('$$$ Loading complete');

  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  loadProxiesForTree(treeId, treeHashEntry, treeConfig){
    // console.log('$$$ Processing tree: ' + treeId);
    // console.log(treeHashEntry);
    let kind = treeHashEntry.kind;

    switch(kind){
      case 'Internal':
      case 'Internal-Lost':
      case 'Internal-Model':
      case 'Internal-View-Model':
        // console.log('::: Only processing children for internal kind: ' + kind);
        break;
      default:
        let item = this.getBlob(treeHashEntry.oid);
        if (item){
          // eslint-disable-next-line no-unused-vars
          let treeProxy : ItemProxy = new ItemProxy(kind,  item, treeConfig);
        } else {
          console.log('*** Could not find item for: ' + kind + ' - with item id - ' + treeId + ' - oid - ' + treeHashEntry.oid);
          console.log(treeHashEntry);
        }
    }

    for(let childId in treeHashEntry.childTreeHashes){
      // console.log('$$$ Child: ' + childId);
      let childTreeHash = treeHashEntry.childTreeHashes[childId];
      if ((childTreeHash !== 'Repository-Mount') &&
        (childTreeHash !== 'Internal')) {
        let childTreeHashEntry = this.getTree(childTreeHash);
        this.loadProxiesForTree(childId, childTreeHashEntry, treeConfig);
      }
    }
  }
}
