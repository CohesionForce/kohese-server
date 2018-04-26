import { Injectable } from '@angular/core';

import * as _ from 'underscore';

import { SocketService } from '../socket/socket.service';
import { CurrentUserService } from '../user/current-user.service';
import { ToastrService } from "ngx-toastr";
import { DialogService } from '../dialog/dialog.service';
import { VersionControlService } from '../version-control/version-control.service';

import * as ItemProxy from '../../../../common/src/item-proxy.js';
import * as ItemCache from '../../../../common/src/item-cache.js';
import * as KoheseModel from '../../../../common/src/KoheseModel.js';
import { CacheManager } from '../../../cache-worker/CacheManager';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

export enum RepoStates {
  DISCONNECTED,
  SYNCHRONIZING,
  SYNCHRONIZATION_FAILED,
  KOHESEMODELS_SYNCHRONIZED,
  SYNCHRONIZATION_SUCCEEDED
};

export enum TreeConfigType {
  DEFAULT,
  HISTORICAL
}

export interface TreeConfigInfo {
  config : any,
  configType : TreeConfigType
}

/**
 *
 */

@Injectable()
export class ItemRepository {
  shortProxyList : Array<ItemProxy>;
  modelTypes : Object;

  recentProxies : Array<ItemProxy>;
  state : any;

  repositoryStatus : BehaviorSubject<any>;
  repoSyncStatus = {};

  currentTreeConfigSubject : BehaviorSubject<TreeConfigInfo> = new BehaviorSubject<TreeConfigInfo>(undefined);

  constructor (private socketService: SocketService,
    private CurrentUserService: CurrentUserService,
    private toastrService : ToastrService,
    private dialogService: DialogService,
    private _versionControlService: VersionControlService) {
    this.initialize();
  }

  initialize () : void {
    console.log('Item Repo init');

    this.repositoryStatus = new BehaviorSubject({
      state: RepoStates.DISCONNECTED,
      message : 'Initializing Item Repository'
    });

    ItemProxy.getWorkingTree().getChangeSubject().subscribe(change => {
      // console.log('+++ Received notification of change: ' + change.type);
      // if(change.proxy){
      //   console.log(change.kind);
      //   console.log(change.proxy.item);
      // }

      switch (change.type){
        case 'loaded':
          console.log('::: ItemProxy is loaded');
          break;
        case 'loading':
          console.log('::: ItemProxy is loading');
          break;
      }
    });

    this.CurrentUserService.getCurrentUserSubject()
      .subscribe((decodedToken) => {
        console.log('Auth IR');
        if (decodedToken) {
          console.log('::: IR: this.socketService already connected');
          this.registerKoheseIOListeners();
          this.fetchItems();
        }
      });

      this.recentProxies = [];
  }


  // End Item Proxy Wrapper

  getRepoStatusSubject () : BehaviorSubject<any> {
    return this.repositoryStatus;
  }

  registerRecentProxy (itemProxy : ItemProxy) {
    this.recentProxies.push(itemProxy);
  }

  getRecentProxies () : Array<ItemProxy> {
    return this.recentProxies;
  }

  registerKoheseIOListeners () : void {
      CacheManager.authenticate();

      // Register the listeners for the Item kinds that are being tracked
      this.socketService.socket.on('Item/create', (notification) => {
        console.log('::: Received notification of ' + notification.kind + ' Created:  ' + notification.item.id);
        var proxy = ItemProxy.getWorkingTree().getProxyFor(notification.item.id);
        if (proxy) {
          proxy.updateItem(notification.kind, notification.item);
        } else {
          if (notification.kind === 'KoheseModel'){
            proxy = new KoheseModel(notification.item);
          } else {
            proxy = new ItemProxy(notification.kind, notification.item);
          }
        }

        this.updateStatus(proxy, notification.status);
        proxy.dirty = false;
      });

      this.socketService.socket.on('Item/update', (notification) => {
        console.log('::: Received notification of ' + notification.kind + ' Updated:  ' + notification.item.id);
        var proxy = ItemProxy.getWorkingTree().getProxyFor(notification.item.id);
        if (proxy) {
          proxy.updateItem(notification.kind, notification.item);
        } else {
          if (notification.kind === 'KoheseModel'){
            proxy = new KoheseModel(notification.item);
          } else {
            proxy = new ItemProxy(notification.kind, notification.item);
          }
        }

        this.updateStatus(proxy, notification.status);
        proxy.dirty = false;
      });

      this.socketService.socket.on('Item/delete', (notification) => {
        console.log('::: Received notification of ' + notification.kind + ' Deleted:  ' + notification.id);
        var proxy = ItemProxy.getWorkingTree().getProxyFor(notification.id);
        proxy.deleteItem();
      });

      this.socketService.socket.on('Item/BulkUpdate', (bulkUpdate) => {
        console.log('::: Received Bulk Update');
        this.processBulkUpdate(bulkUpdate);
      });

      this.socketService.socket.on('VersionControl/statusUpdated', (gitStatusMap) => {
        for (var id in gitStatusMap) {
          var proxy = ItemProxy.getWorkingTree().getProxyFor(id);
          this.updateStatus(proxy, gitStatusMap[id]);
        }
      });

      this.socketService.socket.on('connect_error', () => {
        console.log('::: IR: Socket IO Connection Error');
        this.repositoryStatus.next({
          state: RepoStates.DISCONNECTED,
          message : 'Error connecting to repository'
        })
      });

      this.socketService.socket.on('reconnect', () => {
        if (this.CurrentUserService.getCurrentUserSubject().getValue()) {
          console.log('::: IR: this.authenticationService already authenticated');
          this.fetchItems();
          this.toastrService.success('Reconnected!', 'Server Connection!');
        } else {
          console.log('::: IR: Listening for this.authenticationService authentication');
          let subscription: Subscription = this.CurrentUserService.getCurrentUserSubject()
            .subscribe((decodedToken) => {
              if(decodedToken) {
                console.log('::: IR: Socket Authenticated');
                this.fetchItems();
                this.toastrService.success('Reconnected!', 'Server Connection!');
                subscription.unsubscribe();
              }

          });
        }
      });
    }

  processBulkUpdate(response){
    console.log('::: Processing Bulk Update');
    for(let kind in response.cache) {
      console.log('--- Processing ' + kind);
      var kindList = response.cache[kind];
      for (var index in kindList) {
        let item = JSON.parse(kindList[index]);
        let iProxy;
        if (kind === 'KoheseModel'){
          iProxy = new KoheseModel(item);
        } else {
          try {
            iProxy = new ItemProxy(kind, item);
          } catch(error){
            console.log('*** Error processing item:');
            console.log(kind);
            console.log(item);
            console.log(error);
          }
        }
      }
      if (kind === 'KoheseView'){
        KoheseModel.modelDefinitionLoadingComplete();
        this.repositoryStatus.next({
          state: RepoStates.KOHESEMODELS_SYNCHRONIZED,
          message : 'KoheseModels are available for use'
        });
      }
    }

    if(response.addItems) {
      response.addItems.forEach((addedItem) => {
        let iProxy;
        if (addedItem.kind === 'KoheseModel'){
          iProxy = new KoheseModel(addedItem.item);

        } else {
          iProxy = new ItemProxy(addedItem.kind, addedItem.item);
        }
      });
    }

    if(response.changeItems) {
      response.changeItems.forEach((changededItem) => {
        let iProxy;
        if (changededItem.kind === 'KoheseModel'){
          iProxy = new KoheseModel(changededItem.item);
        } else {
          iProxy = new ItemProxy(changededItem.kind, changededItem.item);
        }
      });
    }

    if(response.deleteItems) {
      response.deleteItems.forEach((deletedItemId) => {
        var proxy = ItemProxy.getWorkingTree().getProxyFor(deletedItemId);
        proxy.deleteItem();
      });
    }
  }

  cacheFetched : boolean = false;

  fetchItems () {

    // this.cacheFetched = true;
    // TODO Remove this
    if (!this.cacheFetched){
      let beforeFetch = Date.now();

      this.repositoryStatus.next({
        state: RepoStates.SYNCHRONIZING,
        message: 'Starting Repository Sync'
      });

      CacheManager.sync((response) => {
        let afterFetch = Date.now();
        console.log('$$$ Fetch time: ' + (afterFetch - beforeFetch)/1000);

        if(response.metaModel){
          console.log('::: Processing MetaModel');
          this.processBulkUpdate({cache: response.metaModel});
        }

        if(response.objectMap){
          console.log('::: Processing Cache');
          let itemCache = new ItemCache();
          itemCache.setObjectMap(response.objectMap);
          ItemProxy.TreeConfiguration.setItemCache(itemCache);

          let workingTree = ItemProxy.TreeConfiguration.getWorkingTree();
          let headCommit = itemCache.getRef('HEAD');
          console.log('### Head: ' + headCommit);

          // TODO Need to load the HEAD commit
          console.log('$$$ Loading HEAD Commit');
          itemCache.loadProxiesForCommit(headCommit, workingTree);
          workingTree.loadingComplete();

          this.cacheFetched = true;
        }

        this.processBulkUpdate(response.allItems);

        let processingComplete = Date.now();
        console.log('$$$ Processing time: ' + (processingComplete - afterFetch)/1000);
        ItemProxy.getWorkingTree().loadingComplete();
        let treehashComplete = Date.now();
        console.log('$$$ TreeHash time: ' + (treehashComplete - processingComplete)/1000);

        // TODO Remove after cache is complete
        // Invoke fetch to peform a delta update
        this.fetchItems();
    });
      return;
    }

    // Load feature switch
    let ifaKey = 'IR-fetch-all';
    let fetchAllStoredValue = localStorage.getItem(ifaKey)
    let fetchAll = true;
    if (fetchAllStoredValue){
      fetchAll = JSON.parse(fetchAllStoredValue);
    };
    console.log('$$$ Fetch All: ' + fetchAll);

    if (fetchAll){
      this.fetchAllItems(null);
    } else {
      console.log('::: Fetching Items');
      var beginFetching = Date.now();
      var origRepoTreeHashes = ItemProxy.getWorkingTree().getRepoTreeHashes();

      this.repositoryStatus.next({
        state: RepoStates.SYNCHRONIZING,
        message: 'Starting Repository Sync'
      });

      // console.log('$$$ Client Repo THM');
      // console.log(origRepoTreeHashes);

      this.socketService.socket.emit('Item/getRepoHashmap', {repoTreeHashes: origRepoTreeHashes}, (response) => {
        var gotResponse = Date.now();
        // console.log('::: Response for getRepoHashmap');
        // console.log('$$$ Response time: ' + (gotResponse-beginFetching)/1000);

        // console.log('$$$ Server Repo THM');
        // console.log(response);

        let repoSyncPending = false;

        for(let repoId in response.repoTreeHashes){
          let repoTreeHash = response.repoTreeHashes[repoId];
          let repoProxy = ItemProxy.getWorkingTree().getProxyFor(repoId);
          let syncRequired = true;
          if (repoProxy && repoProxy.treeHashEntry){
            // A previous fetch has occurried, check to see if there an opportunity to skip resync
            let rTHMCompare = ItemProxy.TreeConfiguration.compareTreeHashMap(repoTreeHash, repoProxy.treeHashEntry);
            if (rTHMCompare.match){
              syncRequired = false;
              // console.log('$$$ Sync not required ' + repoId);
              this.repoSyncStatus[repoId] = RepoStates.SYNCHRONIZATION_SUCCEEDED;
            }
          }

          if (syncRequired){
            this.fetchAllItems(repoId);
            this.repoSyncStatus[repoId] = RepoStates.SYNCHRONIZING;
            repoSyncPending = true;
          }
        }

        if (!repoSyncPending){
          this.repositoryStatus.next({
            state: RepoStates.SYNCHRONIZATION_SUCCEEDED,
            message : 'Item Repository Ready'
          });
        }
      });
    }
  }

  fetchAllItems(forRepoId) {
    console.log('::: Requesting getAll: ' + forRepoId);
    var beginFetching = Date.now();

    let origRepoTreeHashes;
    if (!forRepoId){
      origRepoTreeHashes = ItemProxy.getWorkingTree().getAllTreeHashes()
    } else {
      let repoProxy = ItemProxy.getWorkingTree().getProxyFor(forRepoId);
      if (repoProxy){
        origRepoTreeHashes = repoProxy.getTreeHashMap();
      }
    }

    this.repositoryStatus.next({
      state: RepoStates.SYNCHRONIZING,
      message: 'Starting Repository Sync'
    });

    let request = {
      forRepoId: forRepoId,
      repoTreeHashes: origRepoTreeHashes
    };
    console.log(request);

    this.socketService.socket.emit('Item/getAll', request, (response) => {
      var gotResponse = Date.now();
      console.log('::: Response for getAll');
      console.log('$$$ Response time: ' + (gotResponse-beginFetching)/1000);
      var syncSucceeded = false;
      if(response.kdbMatches) {
        console.log('::: KDB is already in sync');
        syncSucceeded = true;
      } else {

        this.processBulkUpdate(response);

        console.log('::: Compare Repo Tree Hashes After Update');
        var updatedTreeHashes;
        if (!forRepoId){
          ItemProxy.getWorkingTree().loadingComplete();
          updatedTreeHashes = ItemProxy.getWorkingTree().getAllTreeHashes();
        } else {
          let repoProxy = ItemProxy.getWorkingTree().getProxyFor(forRepoId);
          if (repoProxy){
            repoProxy.calculateRepoTreeHashes();
            updatedTreeHashes = repoProxy.getTreeHashMap();
          }
        }

        var compareAfterRTH = ItemProxy.TreeConfiguration.compareTreeHashMap(updatedTreeHashes, response.repoTreeHashes);

        syncSucceeded = compareAfterRTH.match;

        var finishedTime = Date.now();
        console.log('$$$ Processing time: ' + (finishedTime-gotResponse)/1000);

        if(!compareAfterRTH.match) {
          console.log('*** Repository sync failed');
          console.log(compareAfterRTH);
          console.log('$$$ Evaluating differences:');
          let workingTree = ItemProxy.TreeConfiguration.getWorkingTree();
          for (let idx in compareAfterRTH.changedItems){
            let itemId = compareAfterRTH.changedItems[idx];
            let changedProxy = workingTree.getProxyFor(itemId);
            console.log('$$$ Proxy for: ' + itemId);
            console.log(changedProxy);
          }
          this.repositoryStatus.next({
            state: RepoStates.SYNCHRONIZATION_FAILED,
            message : 'Repository sync failed'
          });
          if (forRepoId){
            this.repoSyncStatus[forRepoId] = RepoStates.SYNCHRONIZATION_FAILED;
          }
        }
      }

      if(syncSucceeded){
        if (forRepoId){
          this.repoSyncStatus[forRepoId] = RepoStates.SYNCHRONIZATION_SUCCEEDED;

          let sendFinalSyncRequest = true;

          for(let repoId in this.repoSyncStatus){
            if(this.repoSyncStatus[repoId] != RepoStates.SYNCHRONIZATION_SUCCEEDED) {
              console.log('$$$ Still waiting on repo sync: ' + repoId);
              sendFinalSyncRequest = false;
            }
          }

          if (sendFinalSyncRequest){
            // All of the incremental syncs have succeeded, need to check for any new deltas
            this.fetchAllItems(null);
          }
        } else {
          // Final repo sync
          this.currentTreeConfigSubject.next({
            config: ItemProxy.TreeConfiguration.getWorkingTree(),
            configType : TreeConfigType.DEFAULT
          });
          this.repositoryStatus.next({
            state: RepoStates.SYNCHRONIZATION_SUCCEEDED,
            message : 'Item Repository Ready'
          });

          var rootProxy = ItemProxy.getWorkingTree().getRootProxy();
          this.getStatusFor(rootProxy);
        }
      }
    });
  }

  copyAttributes (fromItem, toItem) {
    // TBD: Need to remove
    console.log('### Deprecated call to copyAttributes');

    // Copy attributes proxy
    for (var key in fromItem) {
      if (key.charAt(0) !== '$' && !_.isEqual(fromItem[key], toItem[key])) {
        toItem[key] = fromItem[key];
      }
    }
  }

  fetchItem (proxy) {
    var promise = new Promise((resolve, reject) => {
      this.socketService.socket.emit('Item/findById', {id: proxy.item.id}, (response) => {
        proxy.updateItem(response.kind, response.item);
        proxy.dirty = false;
        resolve(proxy);
      });
    });

    return promise;
  }

  buildItem(kind: string, item: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.socketService.socket.emit('Item/upsert', {kind: kind, item: item}, (response) => {
        if (response.error) {
          console.log('Error');
          console.log(response);
          reject(response.error);
        } else {
          console.log('Create succeded');
          console.log(response);
          let proxy;
          if (response.kind === 'KoheseModel'){
            proxy = new KoheseModel(response.item);
          } else {
            proxy = new ItemProxy(response.kind, response.item);
          }

          proxy.dirty = false;
          resolve(proxy);
        }
      });
    });
  }

  upsertItem(proxy: ItemProxy): Promise<ItemProxy> {
    return new Promise<ItemProxy>((resolve: ((value: ItemProxy) => void),
      reject: ((value: any) => void)) => {
      this.socketService.getSocket().emit('Item/upsert', {
        kind: proxy.kind,
        item: proxy.item
      }, (response: any) => {
        if (response.error) {
          reject(response.error);
        } else {
          if(!proxy.updateItem) {
            // TODO Need to figure out why this is here
            proxy.item = response.item;

            if (response.kind === 'KoheseModel'){
              proxy = new KoheseModel(response.item);
            } else {
              proxy = new ItemProxy(response.kind, response.item);
            }

          } else {
            proxy.updateItem(response.kind, response.item);
          }
          proxy.dirty = false;
          resolve(proxy);
        }
      });
    });
  }

  deleteItem (proxy, recursive) {
    console.log('::: Preparing to deleteById ' + proxy.kind);

    var promise = new Promise((resolve, reject) => {
      this.socketService.socket.emit('Item/deleteById', {kind: proxy.kind, id: proxy.item.id, recursive: recursive}, (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      });
    });

    return promise;
  }

  generateHTMLReportFor (proxy) {
    this.socketService.socket.emit('Item/generateReport', {onId: proxy.item.id, format: 'html'}, (results) => {
      console.log('::: Report results: ' + results.html);
    });
  }

  generateDOCXReportFor (proxy) {
    this.socketService.socket.emit('Item/generateReport', {onId: proxy.item.id, format: 'docx'}, (results) => {
      console.log('::: Report results: ' + results.docx);
    });
  }

  public getHistoryFor(proxy: ItemProxy): Observable<Array<any>> {
    let emitReturningObservable: (message: string, data: any) => Observable<any> =
      Observable.bindCallback(this.socketService.getSocket().emit.bind(this.
      socketService.getSocket()));
    return emitReturningObservable('Item/getHistory', { onId: proxy.item.id }).
      map((response: any) => {
      proxy.history = response.history;
      /* Return a copy of the history so that subscribers may modify the
      returned history, if desired. */
      return JSON.parse(JSON.stringify(proxy.history));
    });
  }

  getStatusFor (repo) {
    this.socketService.socket.emit('Item/getStatus', {repoId: repo.item.id}, (results) => {
      if (!repo.repoStatus) {
        repo.repoStatus = {};
      }
      repo.repoStatus = results;
      console.log('::: Status retrieved for: ' + repo.item.id + ' - ' + repo.item.name);
      for(var rIdx in repo.repoStatus) {
        var entry = repo.repoStatus[rIdx];
        console.log('+++ ' + rIdx + ' - ' + entry.id + ' - ' + entry.status );

        var proxy = ItemProxy.getWorkingTree().getProxyFor(entry.id);
        if (proxy) {
          this.updateStatus(proxy, entry.status);
        } else {
          console.log('!!! Item not found for entry: ' + rIdx + ' - ' + entry.id + ' - ' + entry.status );
        }
      }
    });
  }

  performAnalysis (forProxy) {
    console.log('::: Performing analysis for ' + forProxy.item.id);

    var promise = new Promise((resolve, reject) => {
      this.socketService.socket.emit('Item/performAnalysis', {kind: forProxy.kind, id:forProxy.item.id}, (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      });
    });

    return promise;
  }

  private updateStatus(proxy: ItemProxy, statuses: Array<string>): void {
    if (statuses.length > 0) {
      proxy.status = this._versionControlService.translateStatus(statuses);
    } else {
      for (let fieldName in proxy.status) {
        delete proxy.status[fieldName];
      }
    }

    ItemProxy.getWorkingTree().getChangeSubject().next({
      type: 'update',
      proxy: proxy
    });
  }

  getTreeConfig() : Observable<any> {
    return this.currentTreeConfigSubject;
  }

  setTreeConfig(treeId : string, configType : TreeConfigType) : void{
    let treeConfiguration: ItemProxy.TreeConfiguration = 
      ItemProxy.TreeConfiguration.getTreeConfigFor(treeId);
    if (!treeConfiguration) {
      treeConfiguration = new ItemProxy.TreeConfiguration(treeId);
      let itemCache = ItemProxy.TreeConfiguration.getItemCache();
      itemCache.loadProxiesForCommit(treeId, treeConfiguration);
      treeConfiguration.loadingComplete();
    }

    this.currentTreeConfigSubject.next({
      config :treeConfiguration, 
      configType: configType
    });
  }
}
