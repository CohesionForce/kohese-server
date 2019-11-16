/**
 *
 */

'use strict';

import * as   _ from 'underscore';
import { ItemProxy } from './item-proxy';
import { TreeHashEntry, TreeHashMap, TreeHashValueType, ItemIdType, TreeHashMapDifference } from './tree-hash';
import { TreeConfiguration } from './tree-configuration';

// TODO set back to false and/or remove disable check below
const disableObjectFreeze = false;
const chunkSize : number = 1000;

export class KoheseCommit {
  // Commit Id
  public commitId: string;
  // Commit Data
  public time: number;
  public author: string;
  public message: string;
  public parents?: Array<ItemIdType>;
  public repoTreeRoots: Workspace;
  // Derived Data
  private treeHashMap?: TreeHashMap;
  private treeDifference?: TreeHashMapDifference;

  //////////////////////////////////////////////////////////////////////////
  constructor (commitId: string, commitData : KoheseCommit){
    this.commitId = commitId;
    this.time = commitData.time;
    this.author = commitData.author;
    this.message = commitData.message;
    if (commitData.parents){
      this.parents = commitData.parents;
    }
    this.repoTreeRoots = commitData.repoTreeRoots;
    if (commitData.treeDifference){
      this.treeDifference = commitData.treeDifference;
    }
  }

  //////////////////////////////////////////////////////////////////////////
  public toJSON() {
    return {
      time: this.time,
      author: this.author,
      message: this.message,
      parents: this.parents,
      repoTreeRoots: this.repoTreeRoots,
      // TODO: Add storage and distribution of treeDifference
      // TODO: Need to determine trade off of transfer vs calc to/at client
      treeDifference: this.treeDifference
    }
  }

  //////////////////////////////////////////////////////////////////////////
  async getTreeHashMap() : Promise<TreeHashMap> {

    if (!this.treeHashMap){
      let itemCache = ItemCache.getItemCache();
      this.treeHashMap = {};
      let treeHashEntryStack : Array<{id:string, treeId:TreeHashValueType}> = [];
      let reversedRootIds = Object.keys(this.repoTreeRoots).reverse();
      for (let repoIdx in reversedRootIds){
        let repoId = reversedRootIds[repoIdx];
        treeHashEntryStack.push({id:repoId, treeId:this.repoTreeRoots[repoId].treeHash});
      }
  
      while (treeHashEntryStack.length > 0) {
        let mapEntry = treeHashEntryStack.pop();
        let treeHashEntry = await itemCache.getTree(mapEntry.treeId)
  
        if (treeHashEntry) {
          this.treeHashMap [mapEntry.id] = treeHashEntry;
  
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

    return this.treeHashMap;
  }

  //////////////////////////////////////////////////////////////////////////
  async getParentCommits() : Promise<Array<KoheseCommit>> {
    let itemCache = ItemCache.getItemCache();
    let parentCommitArray : Array<KoheseCommit> = [];

    for(let parentCommitId of this.parents){
      let parentCommit = await itemCache.getCommit(parentCommitId)
      parentCommitArray.push(parentCommit);
    }

    return parentCommitArray;
  }

  //////////////////////////////////////////////////////////////////////////
  async oldDiff() : Promise<TreeHashMapDifference> {

    if (!this.treeDifference){
      let parentCommits = await this.getParentCommits();

      let prevCommit = parentCommits[0];
  
      if (prevCommit){
        let thisCommitTHM = await this.getTreeHashMap();
        let parentCommitTHM = await prevCommit.getTreeHashMap();
        this.treeDifference = TreeHashMap.diff(parentCommitTHM, thisCommitTHM);
      }
    }

    return this.treeDifference;
  }

  //////////////////////////////////////////////////////////////////////////
  async newDiff(prevCommit?: KoheseCommit) : Promise<TreeHashMapDifference> {

    let itemCache = ItemCache.getItemCache();

    if (!prevCommit){
      let parentCommits = await this.getParentCommits();
      prevCommit = parentCommits[0];
    }

    let leftRoots : Array<ItemIdType> = Object.keys(prevCommit.repoTreeRoots);
    let rightRoots : Array<ItemIdType> = Object.keys(this.repoTreeRoots);

    let sortedLeftRoots = _.clone(leftRoots).sort();
    let sortedRightRoots = _.clone(rightRoots).sort();
    let addedRoots = _.difference(sortedRightRoots, sortedLeftRoots);
    let deletedRoots = _.difference(sortedLeftRoots, sortedRightRoots);
    let commonRoots = _.intersection(leftRoots, rightRoots);

    let treeDifference : TreeHashMapDifference = {
      match: _.isEqual(sortedLeftRoots, sortedRightRoots),
      summary: {
        roots: {
          added: addedRoots,
          deleted: deletedRoots,
          common: commonRoots
        },
        kindChanged: {},
        contentChanged: {},
        parentChanged: {},
        itemAdded: {},
        itemDeleted: {},
        itemMissing: {
          leftMissing: [],
          rightMissing: []
        }
      },
      details: {}
    };

    let left = _.clone(prevCommit.repoTreeRoots);
    let right = _.clone(this.repoTreeRoots);

    let gatherStack : Array<ItemIdType> = _.clone(leftRoots.concat(addedRoots));

    while (gatherStack.length){
      let diffId = gatherStack.pop();
      try {

        let leftVersion : TreeHashEntry = left[diffId];
        let rightVersion : TreeHashEntry = right[diffId];

        if (_.isEqual(leftVersion, rightVersion)){
          // Don't need the nodes for items that match
          delete left[diffId];
          delete right[diffId];
          continue;
        }

        if (leftVersion) {
          for (let leftChildId of Object.keys(leftVersion.childTreeHashes)){
            let leftChildTreeHash = leftVersion.childTreeHashes[leftChildId];
            switch (leftChildTreeHash){
              case "Repository-Mount":
              case "Internal":
                // ignore
                break;
              default:
                if(!left[leftChildId]){
                  let leftChildTree = await itemCache.getTree(leftChildTreeHash);
                  let leftChildTreeClone =  _.clone(leftChildTree);
                  left[leftChildId] = leftChildTreeClone;
                  if(_.indexOf(gatherStack, leftChildId) === -1) {
                    gatherStack.push(leftChildId);
                  }  
                }
            }
          }  
        }

        if (rightVersion) {
          for (let rightChildId of Object.keys(rightVersion.childTreeHashes)){
            let rightChildTreeHash = rightVersion.childTreeHashes[rightChildId];
            switch (rightChildTreeHash){
              case "Repository-Mount":
              case "Internal":
                // ignore
                break;
              default:
                if(!right[rightChildId]){
                  let rightChildTree = await itemCache.getTree(rightChildTreeHash);
                  let rightChildTreeClone =  _.clone(rightChildTree);
                  right[rightChildId] = rightChildTreeClone;
                  if(_.indexOf(gatherStack, rightChildId) === -1) {
                    gatherStack.push(rightChildId);
                  }  
                }
            }
          }  
        }

      } catch (err){
        console.log('*** Error: ' + err + ' while processing ' + diffId);
        console.log(err.stack);
      }
    }

    // TODO: Should this be the union of the roots?
    let compareStack : Array<ItemIdType> = _.clone(commonRoots).reverse();

    while (compareStack.length){
      let diffId = compareStack.pop();
      try {

        let leftVersion : TreeHashEntry = left[diffId];
        let rightVersion : TreeHashEntry = right[diffId];

        if (_.isEqual(leftVersion, rightVersion)){
          continue;
        }

        if (!leftVersion){
          treeDifference.summary.itemMissing.leftMissing.push(diffId);
          treeDifference.match = false;
        }
        if(!rightVersion){
          treeDifference.summary.itemMissing.rightMissing.push(diffId);
          treeDifference.match = false;
        }
        if(!leftVersion || !rightVersion){
          continue;
        }

        let diff = TreeHashEntry.diff(leftVersion, rightVersion);

        if (!diff.match){
          treeDifference.details[diffId] = diff;
          treeDifference.match = false;
        }

        if (diff.kindChanged){
          treeDifference.summary.kindChanged[diffId] = {
            fromKind :diff.kindChanged.fromKind,
            toKind: diff.kindChanged.toKind
          };
        }

        if (diff.contentChanged){
          treeDifference.summary.contentChanged[diffId] = {
            fromOID: diff.contentChanged.fromOID,
            toOID: diff.contentChanged.toOID
          };
        }

        if (diff.parentChanged){
          treeDifference.summary.parentChanged[diffId] = {
            fromParentId :diff.parentChanged.fromId,
            toParentId: diff.parentChanged.toId
          };
        }

        if (diff.childrenAdded){
          let childrenThatMoved : Array<ItemIdType> = [];
          for(let addedChild of diff.childrenAdded) {
          
            // Recursively add children for item that moved
            let childStack : Array<{id:ItemIdType, treeId:TreeHashValueType}> = [ addedChild ];
            while (childStack.length > 0){

              let addedEntry = childStack.pop();

              switch (addedEntry.id){
                case "Repository-Mount":
                case "Internal":
                  // Ignore references to a mount or internal root
                  continue;
              }

              let addedItem = right[addedEntry.id];
              if (!addedItem) {
                // Don't need to process
                continue;
              }

              if (left[addedEntry.id]){
                // Child was moved, add it to the list to get a diff for
                childrenThatMoved.push(addedEntry.id);
              } else {
                // Child was added
                treeDifference.summary.itemAdded[addedEntry.id] = addedEntry.treeId;
              }

              // Now check it's children
              let childIds = Object.keys(addedItem.childTreeHashes);
              if (childIds.length > 0){
                for(let idx in childIds){
                  let childId = childIds[idx];
                  childStack.push({id: childId, treeId: addedItem.childTreeHashes[childId]})
                }
              }
            }
          }

          // Add any new children that have been moved to the compare stack
          childrenThatMoved.reverse();
          childrenThatMoved.forEach((childId) => {
            compareStack.push(childId);
          });
        }

        if (diff.childrenDeleted){
          for(let deletedChild of diff.childrenDeleted) {

            // Recursively add deleted children that have not been moved
            let childStack : Array<{id:ItemIdType, treeId:TreeHashValueType}> = [ deletedChild ];
            while (childStack.length > 0){

              let deletedEntry = childStack.pop();

              switch (deletedEntry.id){
                case "Repository-Mount":
                case "Internal":
                  // Ignore references to a mount or internal root
                  continue;
              }

              let deletedItem = left[deletedEntry.id];
              if (!deletedItem) {
                // Don't need to process
                continue;
              }

              if (right[deletedEntry.id]){
                // Child was moved, it will be added to diff list where it is added
              } else {
                treeDifference.summary.itemDeleted[deletedEntry.id] = deletedEntry.treeId;

                // Now check it's children
                let childIds = Object.keys(deletedItem.childTreeHashes);
                if (childIds.length > 0){
                  for(let idx in childIds){
                    let childId = childIds[idx];
                    childStack.push({id: childId, treeId: deletedItem.childTreeHashes[childId]})
                  }
                }
              }
            }
          }
        }

        if (diff.childrenModified){
          let childrenModified = _.clone(diff.childrenModified);
          childrenModified.reverse();
          childrenModified.forEach((modifiedChild) => {
            compareStack.push(modifiedChild.id);
          });
        }
      } catch (err){
        console.log('*** Error: ' + err + ' while processing ' + diffId);
        console.log(err.stack);
      }
    }

    return treeDifference;
  }
}

export type Workspace = {[id:string] : TreeHashEntry};

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
  private static itemCache : ItemCache;
  private metadata = new Map<string, number>();
  private refMap = new Map<string, any>();
  private tagMap = new Map<string, any>();
  private kCommitMap = new Map<string, KoheseCommit>();
  private kTreeMap  = new Map<string, KoheseTree>();
  private blobMap  = new Map<string, Blob>();
  private workspaceMap  = new Map<string, Workspace>();
  public analysis : CacheAnalysis;

  private mapMap = new Map<string, Map<string, any>>();

  private historyMap;

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
    this.metadata.set('cacheVersion', 0.1);

    // tslint:disable-next-line: no-use-before-declare
    this.analysis = new CacheAnalysis(this);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static setItemCache(itemCache) {
    if (ItemCache.itemCache){
      console.log('*** Error: Unexpected replacement of cache');
    }
    ItemCache.itemCache = itemCache;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static getItemCache() {
    return ItemCache.itemCache;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cacheKeyValuePair(sublevelName, key, value, alreadyCached: boolean = false) {
    // Default implementation does nothing
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
        numBlobs: this.blobMap.size,
        cacheVerersion: this.metadata.get('cacheVersion')
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
  static compareObjects(left, right, prefix = '') {
    // Adjust the prefix
    if (prefix){
      prefix = prefix + '.';
    } else {
      prefix = ''
    }

    // Determine differences
    let leftKeys = Object.keys(left);
    let rightKeys = Object.keys(right);

    let difference : any = {
      match:  _.isEqual(left,right),
      keyOrderMatches: _.isEqual(leftKeys, rightKeys),
    }

    if (difference.match){
      return difference;
    }

    let sortedLeftKeys = _.clone(leftKeys).sort();
    let sortedRightKeys = _.clone(rightKeys).sort();
    difference.addedKeys  = _.difference(sortedRightKeys, sortedLeftKeys);
    difference.deletedKeys = _.difference(sortedLeftKeys, sortedRightKeys);
    let commonKeys = _.intersection(leftKeys, rightKeys);

    difference.details = {
      deleted: {},
      added: {},
      changed: {}
    };

    let details = difference.details;

    for(let key of difference.deletedKeys) {
      details.deleted[prefix + key] = left[key];
    }

    for(let key of difference.addedKeys) {
      details.added[prefix + key] = right[key];
    }

    for(let key of commonKeys) {
      if(!_.isEqual(left[key], right[key])){
        if (_.isObject(left[key])){
          details.changed[prefix + key] = ItemCache.compareObjects(left[key], right[key], prefix + key);
          delete details.changed[prefix + key].match
        } else {
          details.changed[prefix + key] = {}
          details.changed[prefix + key].left = left[key];
          details.changed[prefix + key].right = right[key];
        }
      }
    }
    return difference;
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
    let commitObject = new KoheseCommit(oid, commit);
    this.kCommitMap.set(oid, commitObject);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async getCommit(oid : string) : Promise<KoheseCommit>{
    let commit : KoheseCommit;
    commit = await this.retrieveValue('kCommit', oid);
    return commit;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  addToHistoryMap(itemId, commit) {
    let mapEntry = this.historyMap[itemId];
    if (mapEntry) {
      mapEntry.push(commit);
    } else {
      this.historyMap[itemId] = [commit];
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async getHistory(forItemId: ItemIdType){

    let itemCache : ItemCache = ItemCache.getItemCache();

    if (!this.historyMap){
      let beforeTime = Date.now();
      let commitArray : Array<KoheseCommit> = [];
      this.kCommitMap.forEach((commit) => {
        commitArray.push(commit);
      });
      commitArray.sort((left: KoheseCommit, right: KoheseCommit) => {
        return right.time - left.time;
      });
  
      this.historyMap = {};
      for (let commit of commitArray) {
        let diff : TreeHashMapDifference = await commit.oldDiff();
        if(diff){
          for (let itemId of Object.keys(diff.summary.itemAdded)) {
            this.addToHistoryMap(itemId, {
              change: 'added',
              commit: commit,
              summary: diff.summary.itemAdded[itemId],
              details: {right: await itemCache.getTree(diff.summary.itemAdded[itemId])}
            });
          }
          for (let itemId of Object.keys(diff.summary.contentChanged)) {
            this.addToHistoryMap(itemId, {
              change: 'changed',
              commit: commit,
              summary: diff.summary.contentChanged[itemId],
              details: diff.details[itemId]
            });
          }
          for (let itemId of Object.keys(diff.summary.itemDeleted)) {
            this.addToHistoryMap(itemId, {
              change: 'deleted',
              commit: commit,
              summary: diff.summary.itemDeleted[itemId],
              details: {left: await itemCache.getTree(diff.summary.itemDeleted[itemId])}
            });
          }  
        }
      }
      
      let afterTime = Date.now();
  
      console.log('### Time to compute history map: ' + (afterTime-beforeTime)/1000);
  
    }
 
    let history = [];
    if (this.historyMap[forItemId]){
      this.historyMap[forItemId].forEach((difference) => {
        history.push({
          change: difference.change,
          commitId: difference.commit.commitId,
          message: difference.commit.message,
          author: difference.commit.author,
          date: difference.commit.time,
          summary: difference.summary,
          details: difference.details
        });
      });
    }
    return history;
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
      treeHashMap = await commit.getTreeHashMap();
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
  async loadProxiesForCommit(commitId, treeConfig:TreeConfiguration){
    let commit = await this.getCommit(commitId);

    console.log('$$$ Loading tree config: ' + treeConfig.treeId);
    console.log(JSON.stringify(commit, [ 'time', 'author', 'message', 'parents' ], '  '));

    await this.loadProxiesForTreeRoots(commit.repoTreeRoots, treeConfig);

  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async loadProxiesForTreeRoots(repoTreeRoots:Workspace, treeConfig:TreeConfiguration){

    for(let repoId in repoTreeRoots){
      let repoTreeHashEntry = repoTreeRoots[repoId];
      await this.loadProxiesForTree(repoId, repoTreeHashEntry, treeConfig);
    }

    console.log('$$$ Loading complete: ' + treeConfig.treeId);

  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  private async loadProxiesForTree(treeId, treeHashEntry, treeConfig:TreeConfiguration){
    // console.log('$$$ Processing tree: ' + treeId);
    // console.log(treeHashEntry);
    let kind = treeHashEntry.kind;
    let treeProxy : ItemProxy;

    switch (kind) {
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
          treeProxy = new ItemProxy(kind,  item, treeConfig);
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

    if (treeProxy) {
      treeProxy.calculateTreeHash(true, treeHashEntry.oid, treeHashEntry);
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
  private commitEvaluated = {};
  private missingCacheData = {
    found: false,
    blob: {},
    tree: {},
    root: {},
    commit: {}
  };
  // private reference = {
  //   blob: {},
  //   tree: {},
  //   root: {},
  //   commit: {}
  // };

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

      // // Add reference of blob by tree
      // if (!this.reference.blob[tree.oid]){
      //   this.reference.blob[tree.oid] ={tree: {}};
      // }
      // this.reference.blob[tree.oid].tree[tree.treeHash] = {ref: 'tree'};

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

              // // Add reference of childTree by tree
              // if (!this.reference.tree[childTree.treeHash]){
              //   this.reference.tree[childTree.treeHash] ={tree: {}};
              // }
              // if (!this.reference.tree[childTree.treeHash].tree){
              //   this.reference.tree[childTree.treeHash].tree ={};
              // }
              // this.reference.tree[childTree.treeHash].tree[tree.treeHash] = {ref: 'tree'};

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
    if (commit.parents) {
      for (let parentCommitId of commit.parents) {
        if (!this.commitParentEvaluated[parentCommitId]) {
          // console.log('::: Checking for commit parent: ' + parentCommitId);
          let parentCommit = await this.cache.getCommit(parentCommitId);
          if (!parentCommit) {
            // console.log('*** Missing commit: ' + parentCommitId);
            this.missingCacheData.commit[parentCommitId] = {
              commitId: parentCommitId
            };
            this.missingCacheData.found = true;
          }
          this.commitParentEvaluated[parentCommitId] = true;
        }
      }  
    }

    this.commitEvaluated[commitId] = true;
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
  private markBlobsAsEvaluated() {
    let blobMap = this.cache.getBlobs();
    for (let oid in blobMap) {
      this.blobEvaluated[oid] = true;
    };
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async detectAllMissingData(){
    this.markBlobsAsEvaluated();
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
      delete this.missingCacheData.root[rootTreehash];
    }

    for(let commitId in this.missingCacheData.commit){
      delete this.commitEvaluated[commitId];
      delete this.missingCacheData.commit[commitId];
    }

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

    for(let commitId in missingCacheData.commit){
      let commitInfo = missingCacheData.commit[commitId];
      let commit = await this.cache.getCommit(commitId);
      if (commit){
        // console.log('%%% Reevaluate commit: ' + commitId);
        await this.evaluateCommit(commitInfo.commitId, commit);
      } else {
        // Root is still missing
        console.log('%%% Commit is still missing: ' + commitId);
        this.missingCacheData.commit[commitId] = commitInfo;
        this.missingCacheData.found = true;
      }
    }


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

    if (Object.keys(missingData.commit).length === 0) {
      delete missingData.commit;
    }

    return missingData;
  }
}
