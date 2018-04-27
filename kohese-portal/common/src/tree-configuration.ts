import { ItemProxy } from './item-proxy';
import { Subject } from 'rxjs';

import * as  _ from 'underscore';


let treeConfigMap = {};
let workingTree;
let stagedTree;

// Forward declare KoheseModel while waiting for registration to occur
let KoheseModelDefn;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
export class TreeConfiguration {

  public treeId;
  public proxyMap;
  public idMap;
  public repoMap;
  public loading : boolean = true;
  public proxyHasDeferredModelAssociation;
  public changeSubject : Subject<any>;

  public root;
  public lostAndFound;
  public rootModelProxy;
  public rootViewModelProxy;

  public static itemCache;

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

    console.log('$$$ Checking IP');
    console.log(ItemProxy);
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

    this.rootModelProxy = new ItemProxy('Internal-Model', {
      id: 'Model-Definitions',
      name: 'Model Definitions'
    }, this);

    this.rootViewModelProxy = new ItemProxy('Internal-View-Model', {
      id: 'View-Model-Definitions',
      name: 'View Model Definitions'
    }, this);

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
      stagedTree = new TreeConfiguration('Staged');
    }
    return workingTree;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static getStagedTree() {
    return stagedTree;
  }



  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getRootProxy() {
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
  loadingComplete() {
    this.loading = false;
    this.calculateAllTreeHashes();
    this.changeSubject.next({
      type: 'loaded'
    });
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
  calculateAllTreeHashes() {
    for (let repoId in this.repoMap){
      let repoProxy = this.repoMap[repoId];
      repoProxy.calculateRepoTreeHashes();
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static compareTreeHashMap(fromTHMap, toTHMap){

    var fromIds = Object.keys(fromTHMap).sort();
    var toIds = Object.keys(toTHMap).sort();
    // var allIds = _.union(fromIds, toIds);
    var commonIds = _.intersection(fromIds, toIds);

    var thmCompare = {
      match: _.isEqual(fromTHMap, toTHMap),
      addedItems: _.difference(toIds, fromIds),
      changedItems: [],
      deletedItems: _.difference(fromIds, toIds),
      childMismatch: {}
  };

    commonIds.forEach((key) => {
      var fromNode = fromTHMap[key];
      var toNode = toTHMap[key];

      if (!_.isEqual(fromNode.treeHash, toNode.treeHash)) {

        if (fromNode.oid !== toNode.oid){
          thmCompare.changedItems.push(key);
        } else {
          // Found structural difference at child level
          var fromChildren = fromNode.childTreeHashes;
          var toChildren = toNode.childTreeHashes;
          var fromChildIds = Object.keys(fromChildren);
          var toChildIds = Object.keys(toChildren);
          var fromChildIdsSorted = Object.keys(fromChildren).sort();
          var toChildIdsSorted = Object.keys(toChildren).sort();
          // var allChildIds = _.union(fromChildIdsSorted, toChildIdsSorted);
          var commonChildIds = _.intersection(fromChildIdsSorted, toChildIdsSorted);

          var childMismatch : any = {};

          childMismatch.addedChildren = _.difference(toChildIdsSorted, fromChildIdsSorted);
          childMismatch.deletedChildren = _.difference(fromChildIdsSorted, toChildIdsSorted);


          // Check for different tree hashes
          var changedChildren = {};
          commonChildIds.forEach((childId) => {
            var fromOID = fromChildren[childId];
            var toOID = toChildren[childId];

            if (fromOID !== toOID){
              changedChildren[childId] ={
                  from: fromOID,
                  to: toOID
              };
       }
          });
          childMismatch.changedChildren = changedChildren;

          // Check for different order
          var reorderedChildren = {};
          for (var idx = 0; idx < fromChildIds.length; idx++){
            if(fromChildIds[idx] !== toChildIds[idx]){
              reorderedChildren[idx] = {
                  from: fromChildIds[idx],
                  to: toChildIds[idx]
              };
            }
          }
          childMismatch.reorderedChildren = reorderedChildren;

          thmCompare.childMismatch[key] = childMismatch;
        }
      }

    });

    return thmCompare;

  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getAllTreeHashes() {
    var proxyTreeHashes = {};
    this.root.visitTree(null,(proxy) => {
      proxyTreeHashes[proxy.item.id] = proxy.treeHashEntry;
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
