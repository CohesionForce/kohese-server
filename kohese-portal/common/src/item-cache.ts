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

export type Workspace = Array<TreeHashEntry>;

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
  private workspaceMap  = new Map<string, Workspace>();
  private analysis : CacheAnalysis;

  private mapMap = new Map<string, Map<string, any>>();

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  constructor(sublevel?) {

    this.registerCacheMap('blob', this.blobMap);
    this.registerCacheMap('kTree', this.kTreeMap);
    this.registerCacheMap('kCommit', this.kCommitMap);
    this.registerCacheMap('tag', this.tagMap);
    this.registerCacheMap('ref', this.refMap);
    this.registerCacheMap('workspace', this.workspaceMap);

    this.metadata.set('numRefs', 0);
    this.metadata.set('numTags', 0);
    this.metadata.set('numCommits', 0);
    this.metadata.set('numTrees', 0);
    this.metadata.set('numBlobs', 0);

    // tslint:disable-next-line: no-use-before-declare
    this.analysis = new CacheAnalysis(this);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async saveAllPendingWrites(){
    // Default implementation does nothing
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

    // TODO:  Need to evaluate removal of this method

    let objectMap = {
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
      blobMapChunks: this.splitObject(this.mapToObject(this.blobMap)),
      workspaceMap : this.mapToObject(this.workspaceMap)
    }
    return objectMap;
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
  cacheWorkspace(name:string, workspace:Workspace){
    this.workspaceMap.set(name, workspace);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async getWorkspace(name){
    console.log('%%% Retrieving workspace: ' + name);
    return this.retrieveValue('workspace', name);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getWorkspaces(){
    return this.workspaceMap;
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
  //// Proxy loading methods
  //////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async loadProxiesForCommit(commitId, treeConfig){
    let commit = await this.getCommit(commitId);

    console.log('$$$ Loading tree config: ' + treeConfig.treeId);
    console.log(JSON.stringify(commit, [ 'time', 'author', 'message', 'parents' ], '  '));

    await this.loadProxiesForTreeRoots(commit.repoTreeRoots, treeConfig);

  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async loadProxiesForTreeRoots(repoTreeRoots:Array<TreeHashEntry>, treeConfig){

    for(let repoId in repoTreeRoots){
      let repoTreeHashEntry = repoTreeRoots[repoId];
      await this.loadProxiesForTree(repoId, repoTreeHashEntry, treeConfig);
    }

    console.log('$$$ Loading complete: ' + treeConfig.treeId);

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

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
//// Cache analysis methods
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

export class CacheAnalysis {

  private cache : ItemCache;
  private blobEvaluated = {};
  private treeEvaluated = {};
  private rootEvaluated = {};
  private commitParentEvaluated = {};
  private missingCacheData = {
    found: false,
    blob: {},
    tree: {},
    root: {},
    commit: []
  };

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  constructor (itemCache : ItemCache) {
    this.cache = itemCache;
  }

  //////////////////////////////////////////////////////////////////////////
  async evaluateBlob (itemId, kind, oid) {
    if (!this.blobEvaluated[oid]){
      // console.log('::: Evaluating blob for ' + itemId);
      if (!await this.cache.getBlob(oid)){
        // console.log('*** Missing blob for tree (%s) of kind (%s) with oid (%s)', itemId, kind, oid);
        this.missingCacheData.blob[oid] = {
          itemId: itemId,
          kind: kind,
          oid: oid
        };
        this.missingCacheData.found = true;
      }
      this.blobEvaluated[oid] = true;
    }
  }

  //////////////////////////////////////////////////////////////////////////
  async evaluateTreeEntry (itemId, tree) {
    if (!tree){
      console.log('*** Missing tree for ' + itemId);
    }
    if (tree && !this.treeEvaluated[tree.treeHash]){
      // console.log('::: Evaluating tree for ' + itemId + ' - ' + tree.treeHash);
      await this.evaluateBlob(itemId, tree.kind, tree.oid);
      for (let childId in tree.childTreeHashes) {
        let childTreeHash = tree.childTreeHashes[childId];
        switch (childTreeHash){
          case 'Repository-Mount':
          case 'Internal':
            break;
          default:
            let childTree = await this.cache.getTree(childTreeHash);
            if (childTree) {
              await this.evaluateTreeEntry(childId, childTree);
            } else {
              if (!this.treeEvaluated[childTreeHash]) {
                // console.log('*** Missing tree for tree (%s) with treeHash (%s)', childId, childTreeHash);
                this.missingCacheData.tree[childTreeHash] = {
                  itemId: childId,
                  treeHash: childTreeHash
                };
                this.missingCacheData.found = true;
                this.treeEvaluated[childTreeHash] = true;
              }
            }
        }
      }
      this.treeEvaluated[tree.treeHash] = true;
    }
  }

  //////////////////////////////////////////////////////////////////////////
  async evaluateRoot(rootId, root) {
    if (root && !this.rootEvaluated[root.treeHash]){
      // console.log('::: Evaluating root:  ' + rootId + ' - ' + root.treeHash);

      let rootTree = await this.cache.getTree(root.treeHash);

      if (rootTree) {
        await this.evaluateTreeEntry(rootId, rootTree);
      } else {
        if (!this.rootEvaluated[root.treeHash]) {
          // console.log('*** Missing tree for root (%s) with treeHash (%s)', rootId, root.treeHash);
          this.missingCacheData.root[root.treeHash] = {
            rootId: rootId,
            treeHash: root.treeHash
          };
          this.missingCacheData.found = true;

          // Evaluate with the root tree data instead
          await this.evaluateTreeEntry(rootId, root);
        }
      }
      this.rootEvaluated[root.treeHash] = true;
    }
  }

  //////////////////////////////////////////////////////////////////////////
  async evaluateTreeRoots(repoTreeRoots) {
    for (let rootId in repoTreeRoots){
      let root = repoTreeRoots[rootId];

      await this.evaluateRoot(rootId, root);
    }
  }

  //////////////////////////////////////////////////////////////////////////
  async evaluateCommit(commitId, commit) {
    // console.log('::: Evaluating commit:  ' + commitId);

    await this.evaluateTreeRoots(commit.repoTreeRoots);

    // Check for missing parent commits
    // console.log('::: Checking for parent commits: ' + commit.parents);
    for (let parentCommitId of commit.parents) {
      if (!this.commitParentEvaluated[parentCommitId]) {
        // console.log('::: Checking for commit parent: ' + parentCommitId);
        let parentCommit = await this.cache.getCommit(parentCommitId);
        if (!parentCommit) {
          // console.log('*** Missing commit: ' + parentCommitId);
          this.missingCacheData.commit.push(parentCommitId);
          this.missingCacheData.found = true;
        }
        this.commitParentEvaluated[parentCommitId] = true;
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async detectMissingCacheData(selectedCommitId?, selectedTreeRoots?, selectedTreeId?) {

    // The following logic will evaluate one of the provided inputs.
    // If there are multiple inputs provided, the will be processed
    // in the following precedence: Commit, Tree, Root.  To skip the
    // earlier attributes, provide a null.  Leave all inputs empty to
    // process all commits.

    this.resetMissingDataIndicators();

    if (selectedCommitId !== null) {
    } else if (selectedTreeRoots !== null) {
    } else {

    }

    return this.getMissingData();
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async detectMissingCommitData(selectedCommitId?) {
    let kCommitMap = this.cache.getCommits();
    for (let [commitId, commit] of Array.from(kCommitMap.entries())) {
      if (!selectedCommitId || (selectedCommitId && (commitId === selectedCommitId))){
        await this.evaluateCommit(commitId, commit);
      }
    };

    return this.getMissingData();
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async detectMissingTreeRootData(selectedTreeRoots) {
    await this.evaluateTreeRoots(selectedTreeRoots);
    return this.getMissingData();
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async detectMissingTreeData(selectedTreeId?) {
    let kTreeMap = this.cache.getTrees();
    for (let treeId in kTreeMap) {
      if (!selectedTreeId || (selectedTreeId && (treeId === selectedTreeId))){
        let tree = kTreeMap.get(treeId);

        await this.evaluateTreeEntry(treeId, tree);
      }
    };
    return this.getMissingData();
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async detectAllMissingData(){
    await this.detectMissingTreeData();
    await this.detectMissingCommitData();
    return this.getMissingData();
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  private resetMissingDataIndicators() {
    this.missingCacheData.found = false;

    // Clean out progress indicators
    for(let oid in this.missingCacheData.blob){
      delete this.blobEvaluated[oid];
      delete this.missingCacheData.blob[oid];
    }

    for(let treehash in this.missingCacheData.tree){
      delete this.treeEvaluated[treehash];
      delete this.missingCacheData.tree[treehash];
    }

    for(let rootTreehash in this.missingCacheData.root){
      delete this.rootEvaluated[rootTreehash];
      delete this.missingCacheData[rootTreehash];
    }

    // TODO: Need to clean missing commits

  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async reevaluateMissingData() {
    console.log('%%% Reevaluate missing cache data');
    let missingCacheData = JSON.parse(JSON.stringify(this.missingCacheData));

    this.resetMissingDataIndicators();

    // Begin re-evaluation
    for(let oid in missingCacheData.blob){
      let blobInfo = missingCacheData.blob[oid];
      // console.log('%%% Reevaluate blob: ' + oid);
      await this.evaluateBlob(blobInfo.itemId, blobInfo.kind, blobInfo.oid);
    }

    for(let treehash in missingCacheData.tree){
      let treeInfo = missingCacheData.tree[treehash];
      let tree = await this.cache.getTree(treehash);
      if (tree){
        // console.log('%%% Reevaluate tree: ' + treehash);
        await this.evaluateTreeEntry(treeInfo.itemId, tree);
      } else {
        // Tree is still missing
        console.log('%%% Tree still missing: ' + treehash);
        this.missingCacheData.tree[treehash] = treeInfo;
        this.missingCacheData.found = true;
      }
    }

    for(let rootTreehash in missingCacheData.root){
      let rootInfo = missingCacheData.root[rootTreehash];
      let root = await this.cache.getTree(rootTreehash);
      if (root){
        // console.log('%%% Reevaluate root: ' + rootTreehash);
        await this.evaluateRoot(rootInfo.rootId, root);
      } else {
        // Root is still missing
        console.log('%%% Root is still missing: ' + rootTreehash);
        this.missingCacheData.root[rootTreehash] = rootInfo;
        this.missingCacheData.found = true;
      }
    }

    // TODO: Need to re-evaluate missing commits

    return this.getMissingData();
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getMissingData() {
    let missingData = JSON.parse(JSON.stringify(this.missingCacheData));
    // Delete unneessary result categories
    if (Object.keys(missingData.blob).length === 0) {
      delete missingData.blob;
    }

    if (Object.keys(missingData.tree).length === 0) {
      delete missingData.tree;
    }

    if (Object.keys(missingData.root).length === 0) {
      delete missingData.root;
    }

    if (missingData.commit.length === 0) {
      delete missingData.commit;
    }

    return missingData;
  }
}
