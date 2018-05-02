import { Injectable } from '@angular/core';

import * as _ from 'underscore';

import { SocketService } from '../socket/socket.service';
import { CurrentUserService } from '../user/current-user.service';
import { ToastrService } from "ngx-toastr";
import { DialogService } from '../dialog/dialog.service';
import { VersionControlService } from '../version-control/version-control.service';

import { TreeConfiguration } from  '../../../../common/src/tree-configuration';
import { ItemCache } from '../../../../common/src/item-cache';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { KoheseModel } from '../../../../common/src/KoheseModel';
import { CacheManager } from '../../../cache-worker/CacheManager';

import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { LogService } from '../log/log.service';
import { LogCategories } from '../../../../common/src/k-logger';

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
    private _versionControlService: VersionControlService,
    private logService : LogService) {
    this.initialize();
  }

  initialize () : void {
    this.logService.log('Item Repo init', LogCategories.ITEM_REPOSITORY_INIT);

    this.repositoryStatus = new BehaviorSubject({
      state: RepoStates.DISCONNECTED,
      message : 'Initializing Item Repository'
    });

    ItemProxy.getWorkingTree().getChangeSubject().subscribe(change => {
      
      this.logService.log('+++ Received notification of change: ' + change.type, LogCategories.ALL_PROXY_CHANGES);
      if(change.proxy){
        this.logService.log(change.kind, LogCategories.ALL_PROXY_CHANGES);
        this.logService.log(change.proxy.item, LogCategories.ALL_PROXY_CHANGES);
      }

      switch (change.type){
        case 'loaded':
          this.logService.log('::: ItemProxy is loaded', LogCategories.ITEM_PROXY_INIT);
          break;
        case 'loading':
          this.logService.log('::: ItemProxy is loading', LogCategories.ITEM_PROXY_INIT);
          break;
      }
    });

    this.CurrentUserService.getCurrentUserSubject()
      .subscribe((decodedToken) => {
        this.logService.info('Auth IR', LogCategories.ITEM_PROXY_INIT);
        if (decodedToken) {
          this.logService.log('::: IR: this.socketService already connected', LogCategories.ITEM_PROXY_INIT);
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
        this.logService.log('::: Received notification of ' + notification.kind + ' Created:  ' + notification.item.id, LogCategories.ITEM_CREATE_UPDATES);
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
        this.logService.log('::: Received notification of ' + notification.kind + ' Updated:  ' + notification.item.id, LogCategories.ITEM_UPDATES);
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
        this.logService.log('::: Received notification of ' + notification.kind + ' Deleted:  ' + notification.id, LogCategories.ITEM_DELETE_UPDATES);
        var proxy = ItemProxy.getWorkingTree().getProxyFor(notification.id);
        proxy.deleteItem();
      });

      this.socketService.socket.on('Item/BulkUpdate', (bulkUpdate) => {
        this.logService.log('::: Received Bulk Update', LogCategories.BULK_UPDATES);
        this.logService.log(bulkUpdate, LogCategories.BULK_UPDATES);
        this.processBulkUpdate(bulkUpdate);
      });

      this.socketService.socket.on('VersionControl/statusUpdated', (gitStatusMap) => {
        this.logService.log('::: Received VC status update', LogCategories.VERSION_CONTROL_UPDATES);
        this.logService.log(gitStatusMap, LogCategories.VERSION_CONTROL_UPDATES);
        for (var id in gitStatusMap) {
          var proxy = ItemProxy.getWorkingTree().getProxyFor(id);
          this.updateStatus(proxy, gitStatusMap[id]);
        }
      });

      this.socketService.socket.on('connect_error', () => {
        this.logService.log('::: IR: Socket IO Connection Error', LogCategories.SOCKET_INFO);
        this.repositoryStatus.next({
          state: RepoStates.DISCONNECTED,
          message : 'Error connecting to repository'
        })
      });

      this.socketService.socket.on('reconnect', () => {
        if (this.CurrentUserService.getCurrentUserSubject().getValue()) {
          this.logService.log('::: IR: this.authenticationService already authenticated', LogCategories.SOCKET_INFO);
          this.fetchItems();
          this.toastrService.success('Reconnected!', 'Server Connection!');
        } else {
          this.logService.log('::: IR: Listening for this.authenticationService authentication', LogCategories.SOCKET_INFO);
          let subscription: Subscription = this.CurrentUserService.getCurrentUserSubject()
            .subscribe((decodedToken) => {
              if(decodedToken) {
                this.logService.log('::: IR: Socket Authenticated', LogCategories.SOCKET_INFO);
                this.fetchItems();
                this.toastrService.success('Reconnected!', 'Server Connection!');
                subscription.unsubscribe();
              }

          });
        }
      });
    }

  processBulkUpdate(response){
    this.logService.log('::: Processing Bulk Update', LogCategories.BULK_UPDATES);
    for(let kind in response.cache) {
      this.logService.log('--- Processing ' + kind, LogCategories.BULK_UPDATES);
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
            this.logService.error('*** Error processing item:', LogCategories.BULK_UPDATES);
            this.logService.error(kind, LogCategories.BULK_UPDATES);
            this.logService.error(item, LogCategories.BULK_UPDATES);
            this.logService.error(error, LogCategories.BULK_UPDATES);
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
        this.logService.log('$$$ Fetch time: ' + (afterFetch - beforeFetch)/1000, LogCategories.PERFORMANCE);

        if(response.metaModel){
          this.logService.log('::: Processing MetaModel', LogCategories.ITEM_PROXY_INIT);
          this.processBulkUpdate({cache: response.metaModel});
        }

        if(response.objectMap){
          this.logService.log('::: Processing Cache', LogCategories.TREE_CONFIG_UPDATES);
          let itemCache = new ItemCache();
          itemCache.setObjectMap(response.objectMap);
          TreeConfiguration.setItemCache(itemCache);

          let workingTree = TreeConfiguration.getWorkingTree();
          let headCommit = itemCache.getRef('HEAD');
          this.logService.log('### Head: ' + headCommit, LogCategories.TREE_CONFIG_UPDATES);

          // TODO Need to load the HEAD commit
          this.logService.log('$$$ Loading HEAD Commit', LogCategories.TREE_CONFIG_UPDATES);
          itemCache.loadProxiesForCommit(headCommit, workingTree);
          workingTree.calculateAllTreeHashes();

          this.cacheFetched = true;
        }

        this.processBulkUpdate(response.allItems);

        let processingComplete = Date.now();
        this.logService.log('$$$ Processing time: ' + (processingComplete - afterFetch)/1000, LogCategories.PERFORMANCE);
        ItemProxy.getWorkingTree().loadingComplete();
        let treehashComplete = Date.now();
        this.logService.log('$$$ TreeHash time: ' + (treehashComplete - processingComplete)/1000, LogCategories.PERFORMANCE);

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
    this.logService.log('$$$ Fetch All: ' + fetchAll, LogCategories.ITEM_REPOSITORY_INIT);

    if (fetchAll){
      this.fetchAllItems(null);
    } else {
      this.logService.log('::: Fetching Items', LogCategories.ITEM_REPOSITORY_INIT);
      var beginFetching = Date.now();
      var origRepoTreeHashes = ItemProxy.getWorkingTree().getRepoTreeHashes();

      this.repositoryStatus.next({
        state: RepoStates.SYNCHRONIZING,
        message: 'Starting Repository Sync'
      });

      // this.logService.log('$$$ Client Repo THM');
      // this.logService.log(origRepoTreeHashes);

      this.socketService.socket.emit('Item/getRepoHashmap', {repoTreeHashes: origRepoTreeHashes}, (response) => {
        var gotResponse = Date.now();
        // this.logService.log('::: Response for getRepoHashmap');
        // this.logService.log('$$$ Response time: ' + (gotResponse-beginFetching)/1000);

        // this.logService.log('$$$ Server Repo THM');
        // this.logService.log(response);

        let repoSyncPending = false;

        for(let repoId in response.repoTreeHashes){
          let repoTreeHash = response.repoTreeHashes[repoId];
          let repoProxy = ItemProxy.getWorkingTree().getProxyFor(repoId);
          let syncRequired = true;
          if (repoProxy && repoProxy.treeHashEntry){
            // A previous fetch has occurried, check to see if there an opportunity to skip resync
            let rTHMCompare = TreeConfiguration.compareTreeHashMap(repoTreeHash, repoProxy.treeHashEntry);
            if (rTHMCompare.match){
              syncRequired = false;
              // this.logService.log('$$$ Sync not required ' + repoId);
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
    this.logService.log('::: Requesting getAll: ' + forRepoId, LogCategories.ITEM_REPOSITORY_INIT);
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
    this.logService.log(request, LogCategories.ITEM_REPOSITORY_INIT);

    this.socketService.socket.emit('Item/getAll', request, (response) => {
      var gotResponse = Date.now();
      this.logService.log('::: Response for getAll', LogCategories.ITEM_REPOSITORY_INIT);
      this.logService.log('$$$ Response time: ' + (gotResponse-beginFetching)/1000, LogCategories.PERFORMANCE);
      var syncSucceeded = false;
      if(response.kdbMatches) {
        this.logService.log('::: KDB is already in sync', LogCategories.ITEM_REPOSITORY_INIT);
        syncSucceeded = true;
      } else {

        this.processBulkUpdate(response);

        this.logService.log('::: Compare Repo Tree Hashes After Update', LogCategories.ITEM_REPOSITORY_INIT);
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

        var compareAfterRTH = TreeConfiguration.compareTreeHashMap(updatedTreeHashes, response.repoTreeHashes);

        syncSucceeded = compareAfterRTH.match;

        var finishedTime = Date.now();
        this.logService.log('$$$ Processing time: ' + (finishedTime-gotResponse)/1000, LogCategories.PERFORMANCE);

        if(!compareAfterRTH.match) {
          this.logService.error('*** Repository sync failed', LogCategories.ITEM_REPOSITORY_INIT);
          this.logService.error(compareAfterRTH, LogCategories.ITEM_REPOSITORY_INIT);
          this.logService.log('$$$ Evaluating differences:', LogCategories.ITEM_REPOSITORY_INIT);
          let workingTree = TreeConfiguration.getWorkingTree();
          for (let idx in compareAfterRTH.changedItems){
            let itemId = compareAfterRTH.changedItems[idx];
            let changedProxy = workingTree.getProxyFor(itemId);
            this.logService.log('$$$ Proxy for: ' + itemId, LogCategories.ITEM_REPOSITORY_INIT);
            this.logService.log(changedProxy, LogCategories.ITEM_REPOSITORY_INIT);
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
              this.logService.log('$$$ Still waiting on repo sync: ' + repoId, LogCategories.ITEM_REPOSITORY_INIT);
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
            config: TreeConfiguration.getWorkingTree(),
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
          this.logService.error('Error', LogCategories.ITEM_CREATE_UPDATES);
          this.logService.error(response, LogCategories.ITEM_CREATE_UPDATES);
          reject(response.error);
        } else {
          this.logService.log('Create succeded', LogCategories.ITEM_CREATE_UPDATES);
          this.logService.log(response, LogCategories.ITEM_CREATE_UPDATES);
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
    this.logService.log('::: Preparing to deleteById ' + proxy.kind, LogCategories.ITEM_DELETE_UPDATES);

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
      this.logService.log('::: Report results: ' + results.html, LogCategories.DOCUMENT_GENERATION);
    });
  }

  generateDOCXReportFor (proxy) {
    this.socketService.socket.emit('Item/generateReport', {onId: proxy.item.id, format: 'docx'}, (results) => {
      this.logService.log('::: Report results: ' + results.docx, LogCategories.DOCUMENT_GENERATION);
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
      this.logService.log('::: Status retrieved for: ' + repo.item.id + ' - ' + repo.item.name, LogCategories.VERSION_CONTROL_UPDATES);
      for(var rIdx in repo.repoStatus) {
        var entry = repo.repoStatus[rIdx];
        this.logService.log('+++ ' + rIdx + ' - ' + entry.id + ' - ' + entry.status , LogCategories.VERSION_CONTROL_UPDATES);

        var proxy = ItemProxy.getWorkingTree().getProxyFor(entry.id);
        if (proxy) {
          this.updateStatus(proxy, entry.status);
        } else {
          this.logService.log('!!! Item not found for entry: ' + rIdx + ' - ' + entry.id + ' - ' + entry.status, LogCategories.VERSION_CONTROL_UPDATES );
        }
      }
    });
  }

  performAnalysis (forProxy) {
    this.logService.log('::: Performing analysis for ' + forProxy.item.id, LogCategories.ANALYSIS_INFO);

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
    let treeConfiguration = TreeConfiguration.getTreeConfigFor(treeId);
    if (!treeConfiguration) {
      treeConfiguration = new TreeConfiguration(treeId);
      let itemCache = TreeConfiguration.getItemCache();
      itemCache.loadProxiesForCommit(treeId, treeConfiguration);
      treeConfiguration.loadingComplete();
    }

    this.currentTreeConfigSubject.next({
      config :treeConfiguration,
      configType: configType
    });
  }
}
