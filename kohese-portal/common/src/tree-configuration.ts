import { ItemProxy } from './item-proxy';
import { ItemCache, CacheAnalysis } from './item-cache';
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

  public static itemCache: ItemCache;

  public treeId;
  public proxyMap;
  public idMap;
  public repoMap;
  public loading : boolean = true;
  public treehashCalculated : boolean = false;
  public proxyHasDeferredModelAssociation;
  public changeSubject : Subject<any>;

  public root : ItemProxy;
  public lostAndFound : ItemProxy;
  public rootModelProxy;
  public rootViewModelProxy;


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

    // console.log('$$$ Checking IP');
    // console.log(ItemProxy);
    this.root = new ItemProxy('Internal', {
      id: 'ROOT',
      name : 'Root of Knowledge Tree'
    }, this);
    this.repoMap['ROOT'] = this.root;

    this.lostAndFound = new ItemProxy('Internal', {
      id : 'LOST+FOUND',
      name : 'Lost-And-Found',
      description : 'Collection of node(s) that are no longer connected.'
    }, this);
    this.repoMap['LOST+FOUND'] = this.lostAndFound;

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


    treeConfigMap[treeId] = this;

    return this;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static setItemCache(itemCache) {
    if (this.itemCache){
      console.log('*** Error: Unexpected replacement of cache');
    }
    this.itemCache = itemCache;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static getItemCache() {
    return this.itemCache;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static registerKoheseModelClass(KoheseModelClass) {
    KoheseModelDefn = KoheseModelClass;

    for (let treeId in treeConfigMap){
      let treeConfig = treeConfigMap[treeId];
      for (let id in treeConfig.proxyHasDeferredModelAssociation){
        let proxy = treeConfig.proxyHasDeferredModelAssociation[id];
        proxy.setItemKind(proxy.kind);
        proxy.caclulateDerivedProperties();
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
    let missingCacheData = await TreeConfiguration.itemCache.analysis.detectMissingTreeRootData(treeRoots);
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
            TreeConfiguration.itemCache.cacheBlob(oid, JSON.parse(JSON.stringify(proxy.item)));
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
            TreeConfiguration.itemCache.cacheTree(treehash, JSON.parse(JSON.stringify(proxy.treeHashEntry)));
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
            TreeConfiguration.itemCache.cacheTree(rootTreehash, JSON.parse(JSON.stringify(proxy.treeHashEntry)));
          } else {
            console.log('*** Proxy does not match missing root tree: ' + rootTreehash + ' - ' + proxy.treeHash);
          }
        }
      }

      missingCacheData = await TreeConfiguration.itemCache.analysis.reevaluateMissingData();
      after = Date.now();
    }

    if (foundMissingCacheData){
      await TreeConfiguration.itemCache.saveAllPendingWrites();
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
      }
    }

    // Re-insert rootModelProxy
    rootProxy.addChild(this.rootModelProxy);
    rootProxy.addChild(this.rootViewModelProxy);

    this.dumpAllProxies();
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
    // TODO Need to remove this returning of the ROOT when the string is empty
    if(id === '') {
      return this.root;
    }
    return this.proxyMap[id];
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
