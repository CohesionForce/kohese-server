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
  private metadata = new Map<string, number>();
  private refMap = new Map<string, any>();
  private tagMap = new Map<string, any>();
  private kCommitMap = new Map<string, KoheseCommit>();
  private kTreeMap  = new Map<string, KoheseTree>();
  private blobMap  = new Map<string, Blob>();

  private mapMap = new Map<string, Map<string, any>>();

  private objectMap;

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  constructor(sublevel?) {

    this.registerCacheMap('metadata', this.metadata);
    this.registerCacheMap('ref', this.refMap);
    this.registerCacheMap('tag', this.tagMap);
    this.registerCacheMap('kCommit', this.kCommitMap);
    this.registerCacheMap('kTree', this.kTreeMap);
    this.registerCacheMap('blob', this.blobMap);

    this.metadata.set('numRefs', 0);
    this.metadata.set('numTags', 0);
    this.metadata.set('numCommits', 0);
    this.metadata.set('numTrees', 0);
    this.metadata.set('numBlobs', 0);

  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  registerCacheMap(sublevelName : string, sublevelMap: Map<string,any>) {
    this.mapMap.set(sublevelName, sublevelMap);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  mapToObject (map) {
    let object = {};
    map.forEach((value, key) => {
      object[key] = value;
    });

    return object;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  splitObject (object) {
    let numKeys = _.size(object);
    let numChunks = Math.ceil(numKeys/chunkSize);

    console.log('::: Splitting Object with ' + numKeys + ' keys into ' + numChunks + ' chunks...');
    let newObject = { 0 : {}};
    let chunkIdx = 0;
    let keyIndex = 0;
    for (let key in object){
      newObject[chunkIdx][key] = object[key];
      keyIndex++;
      if ((keyIndex % chunkSize) === 0) {
        chunkIdx++;
        newObject[chunkIdx] = {};
      }
    }

    return newObject;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getObjectMap(){
    if (!this.objectMap){
      this.objectMap = {
        metadata : {
          numRefs: this.refMap.size,
          numTags: this.tagMap.size,
          numCommits: this.kCommitMap.size,
          numTrees: this.kTreeMap.size,
          numBlobs: this.blobMap.size
        },
        refMap : this.mapToObject(this.refMap),
        tagMap : this.mapToObject(this.tagMap),
        kCommitMap : this.mapToObject(this.kCommitMap),
        kTreeMapChunks: this.splitObject(this.mapToObject(this.kTreeMap)),
        blobMapChunks: this.splitObject(this.mapToObject(this.blobMap))
      }
    }
    return this.objectMap;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  setObjectMap(objectMap){
    let metadata = objectMap.metadata;

    if (objectMap.refMap){
      this.refMap = objectMap.refMap;
      this.metadata.set('numRefs', this.refMap.size);
      if(this.metadata.get('numRefs') !== objectMap.metadata.numRefs){
        console.log('*** Number of refs do not match: ' + this.refMap.size);
      }
    }

    if (objectMap.tagMap){
      this.tagMap = objectMap.tagMap;
      this.metadata.set('numTags', this.tagMap.size);
      if(this.metadata.get('numTags') !== objectMap.metadata.numTags){
        console.log('*** Number of tags do not match: ' + this.tagMap.size);
      }
    }

    if (objectMap.kCommitMap){
      this.kCommitMap = objectMap.kCommitMap;
      this.metadata.set('numCommits', this.kCommitMap.size);
      if(this.metadata.get('numCommits') !== objectMap.metadata.numCommits){
        console.log('*** Number of commits do not match: ' + this.kCommitMap.size);
      }
    }

    if (objectMap.kTreeMap){
      this.kTreeMap = objectMap.kTreeMap;
      this.metadata.set('numTrees', this.kTreeMap.size);
      if(this.metadata.get('numTrees') !== objectMap.metadata.numTrees){
        console.log('*** Number of trees do not match: ' + this.kTreeMap);
      }
    }

    if (objectMap.blobMap){
      this.blobMap = objectMap.blobMap;
      this.metadata.set('numBlobs', this.blobMap.size);
      if(this.metadata.get('numBlobs') !== objectMap.metadata.numBlobs){
        console.log('*** Number of blobs do not match: ' + this.blobMap.size);
      }
    }

    if (!_.isEqual(this.mapToObject(this.metadata), objectMap.metadata)){
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
  async retrieveValue (sublevelName, key) : Promise<any> {

    try {
      let map = this.mapMap.get(sublevelName);
      let value = map.get(key);
      return Promise.resolve(value);
    } catch (err) {
      console.log('*** Error: ' + err);
      console.log('*** Attempting to retrieve: ' + sublevelName + ' - ' + key);
      console.log(err.stack);
      return Promise.resolve(undefined);
    }

  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getAllMetaData() : Map<string, number> {
    return this.metadata;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cacheMetaData(key, value){
    this.metadata.set(key, value);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async getMetaData(key){
    return this.retrieveValue('metadata', key);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getRefs(){
    return this.refMap;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cacheRef(ref, oid){
    this.refMap.set(ref, oid);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async getRef(ref){
    return this.retrieveValue('ref', ref);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getTags(){
    return this.tagMap;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cacheTag(tag, oid){
    this.tagMap.set(tag, oid);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async getTag(tag){
    return this.retrieveValue('tag', tag);
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
    this.kCommitMap.set(oid, commit);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async getCommit(oid : string){
    return this.retrieveValue('kCommit', oid);
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
    this.kTreeMap.set(oid, tree);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async getTreeHashMap(forCommit : string) : Promise<TreeHashMap> {
    let treeHashMap: TreeHashMap;
    let commit = await this.getCommit(forCommit);
    if (commit) {
      treeHashMap = {};
      let treeHashEntryStack : Array<{id:string, treeId:TreeHashValueType}> = [];
      let reversedRootIds = Object.keys(commit.repoTreeRoots).reverse();
      for (let repoIdx in reversedRootIds){
        let repoId = reversedRootIds[repoIdx];
        treeHashEntryStack.push({id:repoId, treeId:commit.repoTreeRoots[repoId].treeHash});
      }

      while (treeHashEntryStack.length > 0) {
        let mapEntry = treeHashEntryStack.pop();
        let treeHashEntry = await this.getTree(mapEntry.treeId)

        if (treeHashEntry) {
          treeHashMap [mapEntry.id] = treeHashEntry;

          let reversedChildIds = Object.keys(treeHashEntry.childTreeHashes).reverse();
          for (let childIdx in reversedChildIds){
            let childId = reversedChildIds[childIdx];
            let treeId = treeHashEntry.childTreeHashes[childId];
            switch (treeId){
              case 'Repository-Mount':
              case 'Internal':
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
    }

    return treeHashMap;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async getTree(oid){
    return this.retrieveValue('kTree', oid);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cacheBlob(oid, blob){
    if(!disableObjectFreeze){
      Object.freeze(blob);
    }
    this.blobMap.set(oid, blob);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async getBlob(oid){
    return this.retrieveValue('blob', oid);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getBlobs(){
    return this.blobMap;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  numberOfRefs(){
    return this.refMap.size;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  numberOfTags(){
    return this.tagMap.size;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  numberOfCommits(){
    return this.kCommitMap.size;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  numberOfTrees(){
    return this.kTreeMap.size;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  numberOfBlobs(){
    return this.blobMap.size;
  }

  //////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////
  //// Cache analysis methods
  //////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async detectMissingCacheData(selectedCommitId?, selectedTreeRoots?, selectedTreeId?) {

    let cache = this;
    let blobEvaluated = {};
    let treeEvaluated = {};
    let rootEvaluated = {};
    let commitParentEvaluated = {};

    let missingCacheData = {
      found: false,
      blob: {},
      tree: {},
      root: {},
      commit: []
    };

    //////////////////////////////////////////////////////////////////////////
    async function evaluateBlob (itemId, kind, oid) {
      if (!blobEvaluated[oid]){
        // console.log('::: Evaluating blob for ' + itemId);
        if (!await cache.getBlob(oid)){
          // console.log('*** Missing blob for tree (%s) of kind (%s) with oid (%s)', itemId, kind, oid);
          missingCacheData.blob[oid] = {
            itemdId: itemId,
            kind: kind,
            oid: oid
          };
          missingCacheData.found = true;
        }
        blobEvaluated[oid] = true;
      }
    }

    //////////////////////////////////////////////////////////////////////////
    async function evaluateTreeEntry (itemId, tree) {
      if (!tree){
        console.log('*** Missing tree for ' + itemId);
      }
      if (tree && !treeEvaluated[tree.treeHash]){
        // console.log('::: Evaluating tree for ' + itemId + ' - ' + tree.treeHash);
        await evaluateBlob(itemId, tree.kind, tree.oid);
        for (let childId in tree.childTreeHashes) {
          let childTreeHash = tree.childTreeHashes[childId];
          switch (childTreeHash){
            case 'Repository-Mount':
            case 'Internal':
              break;
            default:
              let childTree = await cache.getTree(childTreeHash);
              if (childTree) {
                await evaluateTreeEntry(childId, childTree);
              } else {
                if (!treeEvaluated[childTreeHash]) {
                  // console.log('*** Missing tree for tree (%s) with treeHash (%s)', childId, childTreeHash);
                  missingCacheData.tree[childTreeHash] = {
                    itemId: childId,
                    treeHash: childTreeHash
                  };
                  missingCacheData.found = true;
                  treeEvaluated[childTreeHash] = true;
                }
              }
          }
        }
        treeEvaluated[tree.treeHash] = true;
      }
    }

    //////////////////////////////////////////////////////////////////////////
    async function evaluateRoot(rootId, root) {
      if (root && !rootEvaluated[root.treeHash]){
        // console.log('::: Evaluating root:  ' + rootId + ' - ' + root.treeHash);

        let rootTree = await cache.getTree(root.treeHash);

        if (rootTree) {
          await evaluateTreeEntry(rootId, rootTree);
        } else {
          if (!rootEvaluated[root.treeHash]) {
            // console.log('*** Missing tree for root (%s) with treeHash (%s)', rootId, root.treeHash);
            missingCacheData.root[root.treeHash] = {
              rootId: rootId,
              treeHash: root.treeHash
            };
            missingCacheData.found = true;

            // Evaluate with the root tree data instead
            await evaluateTreeEntry(rootId, root);
          }
        }
        rootEvaluated[root.treeHash] = true;
      }
    }

    //////////////////////////////////////////////////////////////////////////
    async function evaluateTreeRoots(repoTreeRoots) {
      for (let rootId in repoTreeRoots){
        let root = repoTreeRoots[rootId];

        await evaluateRoot(rootId, root);
      }
    }

    //////////////////////////////////////////////////////////////////////////
    async function evaluateCommit(commitId, commit) {
      // console.log('::: Evaluating commit:  ' + commitId);

      await evaluateTreeRoots(commit.repoTreeRoots);

      // Check for missing parent commits
      // console.log('::: Checking for parent commits: ' + commit.parents);
      for (let parentCommitId of commit.parents) {
        if (!commitParentEvaluated[parentCommitId]) {
          // console.log('::: Checking for commit parent: ' + parentCommitId);
          let parentCommit = await cache.getCommit(parentCommitId);
          if (!parentCommit) {
            // console.log('*** Missing commit: ' + parentCommitId);
            missingCacheData.commit.push(parentCommitId);
            missingCacheData.found = true;
          }
          commitParentEvaluated[parentCommitId] = true;
        }
      }
    }

    // The following logic will evaluate one of the provided inputs.
    // If there are multiple inputs provided, the will be processed
    // in the following precedence: Commit, Tree, Root.  To skip the
    // earlier attributes, provide a null.  Leave all inputs empty to
    // process all commits.

    if (selectedCommitId !== null) {
      for (let [commitId, commit] of Array.from(this.kCommitMap.entries())) {
        if (!selectedCommitId || (selectedCommitId && (commitId === selectedCommitId))){
          await evaluateCommit(commitId, commit);
        }
      };
    } else if (selectedTreeRoots !== null) {
      await evaluateTreeRoots(selectedTreeRoots);
    } else {

      for (let treeId in this.kTreeMap) {
        if (!selectedTreeId || (selectedTreeId && (treeId === selectedTreeId))){
          let tree = this.kTreeMap.get(treeId);

          await evaluateTreeEntry(treeId, tree);
        }
      };
    }

    // Delete unneessary result categories
    if (Object.keys(missingCacheData.blob).length === 0) {
      delete missingCacheData.blob;
    }

    if (Object.keys(missingCacheData.tree).length === 0) {
      delete missingCacheData.tree;
    }

    if (Object.keys(missingCacheData.root).length === 0) {
      delete missingCacheData.root;
    }

    if (missingCacheData.commit.length === 0) {
      delete missingCacheData.commit;
    }

    return missingCacheData;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async detectMissingCommitData(selectedCommitId?) {
    return await this.detectMissingCacheData(selectedCommitId);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async detectMissingTreeRootData(selectedTreeRoots) {
    return await this.detectMissingCacheData(null, selectedTreeRoots);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async detectMissingTreeData(selectedTreeId?) {
    return await this.detectMissingCacheData(null, null, selectedTreeId);
  }

  //////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////
  //// Proxy loading methods
  //////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async loadProxiesForCommit(commitId, treeConfig){
    let commit = await this.getCommit(commitId);

    console.log('$$$ Loading commit: ');
    console.log(JSON.stringify(commit, [ 'time', 'author', 'message', 'parents' ], '  '));

    for(let repoId in commit.repoTreeRoots){
      let repoTreeHashEntry = commit.repoTreeRoots[repoId];
      await this.loadProxiesForTree(repoId, repoTreeHashEntry, treeConfig);
    }

    console.log('$$$ Loading complete');

  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  private async loadProxiesForTree(treeId, treeHashEntry, treeConfig){
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
        let item = await this.getBlob(treeHashEntry.oid);
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
        let childTreeHashEntry = await this.getTree(childTreeHash);
        await this.loadProxiesForTree(childId, childTreeHashEntry, treeConfig);
      }
    }
  }
}
