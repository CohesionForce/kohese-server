/*
 * Copyright (c) 2021 CohesionForce inc. | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 *
 */

'use strict';

import * as   _ from 'underscore';
import { ItemProxy } from './item-proxy';
import { TreeHashEntry, TreeHashMap, TreeHashValueType, ItemIdType, TreeHashMapDifference } from './tree-hash';
import { TreeConfiguration } from './tree-configuration';
import { KoheseCommit, Workspace } from './kohese-commit';
import { CacheAnalysis } from './cache-analysis';

// TODO set back to false and/or remove disable check below
const disableObjectFreeze = false;
const chunkSize : number = 1000;

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
        cacheVersion: this.metadata.get('cacheVersion')
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
  async getHistoryMap() : Promise<any> {
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
        let diff : TreeHashMapDifference = await commit.newDiff();
        if(diff){
          for (let itemId of Object.keys(diff.summary.itemAdded)) {
            let newTreeEntry = await this.getTree(diff.summary.itemAdded[itemId]);
            this.addToHistoryMap(itemId, {
              change: 'added',
              commit: commit,
              newTreeEntry: newTreeEntry,
              summary: diff.summary.itemAdded[itemId],
              details: {right: newTreeEntry}
            });
          }
          for (let itemId of Object.keys(diff.summary.contentChanged)) {
            this.addToHistoryMap(itemId, {
              change: 'changed',
              commit: commit,
              newTreeEntry: diff.details[itemId].right,
              oldTreeEntry: diff.details[itemId].left,
              summary: diff.summary.contentChanged[itemId],
              details: diff.details[itemId]
            });
          }
          for (let itemId of Object.keys(diff.summary.itemDeleted)) {
            let oldTreeEntry = await this.getTree(diff.summary.itemDeleted[itemId]);
            this.addToHistoryMap(itemId, {
              change: 'deleted',
              commit: commit,
              oldTreeEntry: oldTreeEntry,
              summary: diff.summary.itemDeleted[itemId],
              details: {left: oldTreeEntry}
            });
          }
        }
      }

      let afterTime = Date.now();

      console.log('### Time to compute history map: ' + (afterTime-beforeTime)/1000);

    }

    return this.historyMap;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async getHistoryWithNewStyle(forItemId: ItemIdType){

    if (!this.historyMap){
      let hMap = await this.getHistoryMap();
    }

    let history = [];
    if (this.historyMap[forItemId]){
      this.historyMap[forItemId].forEach((difference) => {
        history.push({
          change: difference.change,
          commitId: difference.commit.commitId,
          message: difference.commit.message,
          author: difference.commit.author,
          time: difference.commit.time,
          newTreeEntry: difference.newTreeEntry,
          oldTreeEntry: difference.oldTreeEntry,
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
  async getHistory(forItemId: ItemIdType){

    let newHistory = await this.getHistoryWithNewStyle(forItemId);
    let oldStyleHistory = [];

    for (let entry of newHistory){
      let indexEntry = {};
      if (entry.newTreeEntry){
        indexEntry = {
          oid: entry.newTreeEntry.oid,
          kind: entry.newTreeEntry.kind
        }
      }
      oldStyleHistory.push({
        commit: entry.commitId,
        message: entry.message,
        author: entry.author,
        date: entry.time,
        indexEntry: indexEntry
      });
    }
    return oldStyleHistory;
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
