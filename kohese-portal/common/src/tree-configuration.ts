/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
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


import { ItemProxy } from './item-proxy';
import { ItemCache } from './item-cache';
import { KoheseModel } from './KoheseModel';
import { Subject } from 'rxjs';

import * as  _ from 'underscore';


let treeConfigMap : { [treeId:string] : TreeConfiguration } = {};
let workingTree : TreeConfiguration;
let stagedTree : TreeConfiguration;

// Forward declare KoheseModel while waiting for registration to occur
let KoheseModelDefn;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
export class TreeConfiguration {

  public treeId;
  public proxyMap;
  public idMap;
  private repoMap;
  public loading : boolean = true;
  public treehashCalculated : boolean = false;
  public proxyHasDeferredModelAssociation;
  public changeSubject : Subject<any>;
  public repoChangeSubject : Subject<any>;

  public root : ItemProxy;
  public lostAndFound : ItemProxy;
  public rootModelProxy;
  public rootViewModelProxy;
  public rootRepoMountProxy;


  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  constructor (treeId){
    let treeConfig = treeConfigMap[treeId];

    if (treeConfig){
      return treeConfig;
    }

    console.log('::: Creating TreeConfiguration for: ' + treeId);

    this.treeId = treeId;
    this.proxyMap = {};
    this.idMap = {};
    this.repoMap = {};
    this.loading = true;
    this.proxyHasDeferredModelAssociation = {};

    this.changeSubject = new Subject<any>();
    this.repoChangeSubject = new Subject<any>();

    // console.log('$$$ Checking IP');
    // console.log(ItemProxy);
    this.root = new ItemProxy('Internal', {
      id: 'ROOT',
      name : 'Root of Knowledge Tree'
    }, this);
    this.repoMap['ROOT'] = this.root;
    this.addIdMap('Item', 'id', this.root);

    this.lostAndFound = new ItemProxy('Internal', {
      id : 'LOST+FOUND',
      name : 'Lost-And-Found',
      description : 'Collection of node(s) that are no longer connected.'
    }, this);
    this.repoMap['LOST+FOUND'] = this.lostAndFound;
    this.addIdMap('Item', 'id', this.lostAndFound);

    this.rootModelProxy = new ItemProxy('Internal', {
      id: 'Model-Definitions',
      name: 'Model Definitions'
    }, this);
    this.root.addChild(this.rootModelProxy);
    this.repoMap['Model-Definitions'] = this.rootModelProxy;

    this.rootViewModelProxy = new ItemProxy('Internal', {
      id: 'View-Model-Definitions',
      name: 'View Model Definitions'
    }, this);
    this.root.addChild(this.rootViewModelProxy);
    this.repoMap['View-Model-Definitions'] = this.rootViewModelProxy;

    this.rootRepoMountProxy = new ItemProxy('Internal', {
      id: 'Repo-Mount-Definitions',
      name: 'Repo Mount Definitions'
    }, this);
    this.root.addChild(this.rootRepoMountProxy);
    this.repoMap['Repo-Mount-Definitions'] = this.rootRepoMountProxy;

    treeConfigMap[treeId] = this;

    return this;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static registerKoheseModelClass(KoheseModelClass) {
    KoheseModelDefn = KoheseModelClass;

    for (let treeId in treeConfigMap){
      let treeConfig = treeConfigMap[treeId];
      for (let id in treeConfig.proxyHasDeferredModelAssociation){
        let proxy : ItemProxy = treeConfig.proxyHasDeferredModelAssociation[id];
        proxy.setItemKind(proxy.kind);
        proxy.calculateDerivedProperties();
        proxy.updateReferences();
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static get koheseModelDefn() {
    return KoheseModelDefn;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static getTreeConfigFor(treeId) {
    return treeConfigMap[treeId];
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static getWorkingTree() {

    if (!workingTree){
      workingTree = new TreeConfiguration('Unstaged');
    }
    return workingTree;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static getStagedTree() {
    if (!stagedTree){
      stagedTree = new TreeConfiguration('Staged');
    }
    return stagedTree;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getVCStatus(): Array<any> {
    let rootProxy = workingTree.getRootProxy();
    let idStatusArray = [];
    rootProxy.visitTree(null,(proxy: ItemProxy) => {
      let statusArray = proxy.vcStatus.statusArray;
      if (statusArray.length){
        idStatusArray.push({
          id: proxy.item.id,
          status: statusArray
        });
      }
    });
    return idStatusArray;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static compareVCStatus(left: Array<any>, right: Array<any>): any {
    let result = {};
    for (let idx: number = 0; idx< left.length; idx++) {
      let vcStatus = left[idx];
      result[vcStatus.id] = {
        from: vcStatus.status
      }
    }
    for (let idx: number = 0; idx < right.length; idx++) {
      let vcStatus = right[idx];
      if (result[vcStatus.id]) {
        // vcStatus exists in left and right
        if (_.isEqual(result[vcStatus.id].from, vcStatus.status)) {
          delete result[vcStatus.id];
        } else {
          result[vcStatus.id].to = vcStatus.status;
        }
      } else {
          //vcStatus does not exist in left
          result[vcStatus.id] = {
            to: vcStatus.status
          };
      }
    }
    return result;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  deleteConfig(){
    delete treeConfigMap[this.treeId];
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getRootProxy() : ItemProxy {
    return this.root;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  setLoading() {
    this.loading = true;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  unsetLoading(deferCalc: boolean = false) : Promise<any> {
    console.log('::: Loading complete called for tree: ' + this.treeId + ' (deferCalc = ' + deferCalc + ')');
    this.loading = false;
    let deferredCalcPromise = this.calculateAllTreeHashes(deferCalc);
    return deferredCalcPromise;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getLostAndFoundProxy() {
    return this.lostAndFound;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getChangeSubject() {
    return this.changeSubject;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  addIdMap(kind, idProperty, forProxy){
    let idValue = forProxy.item[idProperty];
    if (!this.idMap[kind]){
      // Create empty map for the kind
      this.idMap[kind] = {};
    }
    if (!this.idMap[kind][idProperty]){
      // Create empty map for the kind
      this.idMap[kind][idProperty] = {};
    }
    // console.log('$$$ Adding map for: ' + kind + ' - ' + idProperty + ' - ' + idValue);
    this.idMap[kind][idProperty][idValue] = forProxy;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  removeIdMap(kind, idProperty, forProxy){
    let idValue = forProxy.item[idProperty];
    if (this.idMap[kind] && this.idMap[kind][idProperty] &&
        this.idMap[kind][idProperty][idValue])
    {
      delete this.idMap[kind][idProperty][idValue];
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  deleteRepo(id: string) {
    delete this.repoMap[id];
    this.repoChangeSubject.next({
      id: id,
      type: 'deleted'
    });
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  addRepo(id: string, proxy: ItemProxy) {
    this.repoMap[id] = proxy;
    this.repoChangeSubject.next({
      id: id,
      type: 'added'
    });
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  loadingComplete(deferCalc: boolean = false) : Promise<any> {
    console.log('::: Loading complete called for tree: ' + this.treeId + ' (deferCalc = ' + deferCalc + ')');
    this.loading = false;
    let deferredCalcPromise = this.calculateAllTreeHashes(deferCalc);
    this.changeSubject.next({
      type: 'loaded'
    });
    return deferredCalcPromise;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async saveToCache() {
    let treeRoots = this.getRepoTreeHashes();
    console.log('::: Checking for missing cache data for: ' + this.treeId);
    let before = Date.now();
    let itemCache = ItemCache.getItemCache();
    let missingCacheData = await itemCache.analysis.detectMissingTreeRootData(treeRoots);
    let after = Date.now();
    let foundMissingCacheData = false;
    let updateIteration = 0;
    while (missingCacheData.found  && (missingCacheData.blob || missingCacheData.tree || missingCacheData.root)) {
      foundMissingCacheData = true;
      updateIteration++;
      console.log('!!! Found missing cache data for: ' + this.treeId + ' - ' + updateIteration + ' - ' + (after-before)/1000);
      // console.log(JSON.stringify(missingCacheData, null, '  '));

      if(missingCacheData.blob){
        for(let oid in missingCacheData.blob){
          let missingBlobInfo = missingCacheData.blob[oid];

          // console.log('%%% Trying to find missing blob oid: ' + oid);
          let proxy = this.getProxyFor(missingBlobInfo.itemId);
          if(proxy.oid === oid){
            // console.log('%%% Proxy matches missing blob oid: ' + oid);
            itemCache.cacheBlob(oid, JSON.parse(JSON.stringify(proxy.cloneItemAndStripDerived())));
          } else {
            console.log('*** Proxy does not match missing blob oid: ' + oid + ' - ' + proxy.oid);
          }
        }
      }

      if(missingCacheData.tree){
        for(let treehash in missingCacheData.tree){
          let missingTreeInfo = missingCacheData.tree[treehash];
          // console.log('%%% Trying to find missing tree: ' + treehash);
          let proxy = this.getProxyFor(missingTreeInfo.itemId);
          if(proxy.treeHash === treehash){
            // console.log('%%% Proxy matches missing tree: ' + treehash);
            itemCache.cacheTree(treehash, JSON.parse(JSON.stringify(proxy.treeHashEntry)));
          } else {
            console.log('*** Proxy does not match missing tree: ' + treehash + ' - ' + proxy.treeHash);
          }
        }
      }

      if(missingCacheData.root){
        for(let rootTreehash in missingCacheData.root){
          let missingRootInfo = missingCacheData.root[rootTreehash];
          let itemId = missingRootInfo.rootId;

          let proxy = this.getProxyFor(missingRootInfo.rootId);
          if(proxy.treeHash === rootTreehash){
            // console.log('%%% Proxy matches missing tree: ' + treehash);
            itemCache.cacheTree(rootTreehash, JSON.parse(JSON.stringify(proxy.treeHashEntry)));
          } else {
            console.log('*** Proxy does not match missing root tree: ' + rootTreehash + ' - ' + proxy.treeHash);
          }
        }
      }

      missingCacheData = await itemCache.analysis.reevaluateMissingData();
      after = Date.now();
    }

    if (foundMissingCacheData){
      await itemCache.saveAllPendingWrites();
    }
    console.log('::: Total time to check and save cache updates: ' + (after-before)/1000)
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  reset(skipModels : boolean = false) {

    console.log('::: Resetting TreeConfiguration for: ' + this.treeId);
    let rootProxy = this.getRootProxy();

    this.loading = true;

    this.changeSubject.next({
      type: 'loading'
    });

    rootProxy.removeChild(this.rootModelProxy);
    rootProxy.removeChild(this.rootViewModelProxy);

    rootProxy.visitChildren(null, null, (childProxy) => {
      childProxy.deleteItem();
    });

    // Delete children of models if we are not skipping models
    if (!skipModels) {
      this.rootModelProxy.visitChildren(null, null, (childProxy) => {
        childProxy.deleteItem();
      });
      this.rootViewModelProxy.visitChildren(null, null, (childProxy) => {
        childProxy.deleteItem();
      });
      if (KoheseModelDefn){
        KoheseModelDefn.removeLoadedModels();
        KoheseModelDefn = undefined;
      }
    }

    // Re-insert rootModelProxy
    rootProxy.addChild(this.rootModelProxy);
    rootProxy.addChild(this.rootViewModelProxy);

    this.treehashCalculated = false;
    // this.dumpAllProxies();
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getAllItemProxies() {
    var itemProxyList = [];
    for ( var key in this.proxyMap) {
      itemProxyList.push(this.proxyMap[key]);
    }
    return itemProxyList;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getProxyFor(id) : ItemProxy {
    let itemProxy: ItemProxy;
    // TODO Need to remove this returning of the ROOT when the string is empty
    if(id === '') {
      itemProxy = this.root;
    } else {
      itemProxy = this.proxyMap[id];
    }

    if ((itemProxy == null) && (this !== TreeConfiguration.getWorkingTree())) {
      itemProxy = TreeConfiguration.getWorkingTree().getProxyFor(id);
      if ((itemProxy != null) && (itemProxy.kind !== 'KoheseModel')) {
        itemProxy = undefined;
      }
    }

    return itemProxy;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getModelProxyFor(id) : KoheseModel {
    let modelProxy: ItemProxy;
    modelProxy = this.proxyMap[id];

    if (modelProxy.kind !== 'KoheseModel') {
      console.log('*** Request for model %s returned a %s', id, modelProxy.kind);
    }

    return modelProxy as KoheseModel;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getProxyByProperty(kind, idProperty, idValue) {
    let proxy;
    if (this.idMap[kind] && this.idMap[kind][idProperty] &&
      this.idMap[kind][idProperty][idValue])
    {
      proxy = this.idMap[kind][idProperty][idValue];
    }
    return proxy;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  private async calculateAllTreeHashes(deferCalc : boolean = false) {
    console.log('::: Beginning calculation of treehashes')
    const isRepoOnly = false;
    let before = Date.now();
    let treeHashCalculations : Array<Promise<number>> = [];
    if (isRepoOnly){
      for (let repoId in this.repoMap){
        let repoProxy : ItemProxy = this.repoMap[repoId];
        treeHashCalculations.push(repoProxy.calculateTreeHashes(deferCalc, isRepoOnly));
      }
    } else {
      treeHashCalculations.push(this.getRootProxy().calculateTreeHashes(deferCalc, isRepoOnly));
    }

    if (deferCalc){
      Promise.all(treeHashCalculations).then(() => {
        this.treehashCalculated = true;
        let after = Date.now();
        console.log('$$$ TreeHash Calculation Completed: ' + (after-before)/1000);
      });
    } else {
      this.treehashCalculated = true;
      let after = Date.now();
      console.log('$$$ TreeHash Calculation Completed: ' + (after-before)/1000);
    }

    return treeHashCalculations;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getAllTreeHashes() {

    // TODO: Remove these log statements

    if (!this.treehashCalculated){
      // TreeHashes have not been calculated yet
      console.log('$$$ Treehashes have not been calculated');
      this.calculateAllTreeHashes();
      console.log('$$$ Treehash calculation completed');
    } else {
      console.log('$$$ Treehashes are already calculated');
    }

    var proxyTreeHashes = {};
    this.root.visitTree(null,(proxy) => {
      if (proxy.treeHashEntry){
        proxyTreeHashes[proxy.item.id] = proxy.treeHashEntry;
      }
    });

    return proxyTreeHashes;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getRepoTreeHashes() {
    var repoTreeHashes = {};

    for(var repoIdx in this.repoMap){
      var repoProxy = this.repoMap[repoIdx];
      repoTreeHashes[repoIdx] = repoProxy.treeHashEntry;
    }
    return repoTreeHashes;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getRepositories() {
    var repoList = [];
    for(var id in this.repoMap){
      var proxy = this.repoMap[id];
      if (proxy.kind === 'Repository'){
        repoList.push(proxy);
      }
    }
    return repoList;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  dumpAllProxies() {
    for ( var proxyId in this.proxyMap) {
      var proxy = this.proxyMap[proxyId];
      console.log('::: Dumping ' + proxy.item.id + ' - ' + proxy.item.name +
          ' - ' + proxy.kind);
    }
  }
}
