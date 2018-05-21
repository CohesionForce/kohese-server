import { Injectable } from '@angular/core';

import * as _ from 'underscore';

import { SocketService } from '../socket/socket.service';
import { CurrentUserService } from '../user/current-user.service';
import { ToastrService } from "ngx-toastr";
import { DialogService } from '../dialog/dialog.service';
import { VersionControlService } from '../version-control/version-control.service';

import { TreeConfiguration } from  '../../../../common/src/tree-configuration';
import { TreeHashMap, TreeHashEntry } from '../../../../common/src/tree-hash';
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
import { InitializeLogs } from './item-repository.registry';

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
  config: any,
  configType: TreeConfigType
}

/**
 *
 */

@Injectable()
export class ItemRepository {
  shortProxyList: Array<ItemProxy>;
  modelTypes: Object;

  private static loggingInitialized: boolean = false;
  private static componentId: number;
  private static itemRepoInitEvent: number;
  logEvents: any;

  static receivedNofificationOfChangeEvent: number;

  recentProxies: Array<ItemProxy>;
  state: any;

  repositoryStatus: BehaviorSubject<any>;
  repoSyncStatus = {};

  currentTreeConfigSubject: BehaviorSubject<TreeConfigInfo> = new BehaviorSubject<TreeConfigInfo>(undefined);

  constructor(private socketService: SocketService,
    private CurrentUserService: CurrentUserService,
    private toastrService: ToastrService,
    private dialogService: DialogService,
    private _versionControlService: VersionControlService,
    private logService: LogService) {

    this.logEvents = InitializeLogs(logService)
    this.initialize();
  }

  initialize(): void {
    this.logService.log(this.logEvents.itemRepoInit);

    this.repositoryStatus = new BehaviorSubject({
      state: RepoStates.DISCONNECTED,
      message: 'Initializing Item Repository'
    });

    ItemProxy.getWorkingTree().getChangeSubject().subscribe(change => {

      this.logService.log(this.logEvents.receivedNofificationOfChange, { change: change });

      switch (change.type) {
        case 'loaded':
          this.logService.log(this.logEvents.itemProxyLoaded);
          break;
        case 'loading':
          this.logService.log(this.logEvents.itemProxyLoading);
          break;
      }
    });

    this.CurrentUserService.getCurrentUserSubject()
      .subscribe((decodedToken) => {
        this.logService.log(this.logEvents.itemRepositoryAuthenticated);
        if (decodedToken) {
          this.logService.log(this.logEvents.socketAlreadyConnected);
          this.registerKoheseIOListeners();
          this.fetchItems();
        }
      });

    this.recentProxies = [];
  }


  // End Item Proxy Wrapper

  getRepoStatusSubject(): BehaviorSubject<any> {
    return this.repositoryStatus;
  }

  registerRecentProxy(itemProxy: ItemProxy) {
    this.recentProxies.push(itemProxy);
  }

  getRecentProxies(): Array<ItemProxy> {
    return this.recentProxies;
  }

  registerKoheseIOListeners(): void {
    CacheManager.authenticate();

    // Register the listeners for the Item kinds that are being tracked
    this.socketService.socket.on('Item/create', (notification) => {
      this.logService.log(this.logEvents.itemCreated, {notification : notification});
      var proxy = ItemProxy.getWorkingTree().getProxyFor(notification.item.id);
      if (proxy) {
        proxy.updateItem(notification.kind, notification.item);
      } else {
        if (notification.kind === 'KoheseModel') {
          proxy = new KoheseModel(notification.item);
        } else {
          proxy = new ItemProxy(notification.kind, notification.item);
        }
      }

      this.updateStatus(proxy, notification.status);
      proxy.dirty = false;
    });

    this.socketService.socket.on('Item/update', (notification) => {
      this.logService.log(this.logEvents.itemUpdated, {notification : notification});
      var proxy = ItemProxy.getWorkingTree().getProxyFor(notification.item.id);
      if (proxy) {
        proxy.updateItem(notification.kind, notification.item);
      } else {
        if (notification.kind === 'KoheseModel') {
          proxy = new KoheseModel(notification.item);
        } else {
          proxy = new ItemProxy(notification.kind, notification.item);
        }
      }

      this.updateStatus(proxy, notification.status);
      proxy.dirty = false;
    });

    this.socketService.socket.on('Item/delete', (notification) => {
      this.logService.log(this.logEvents.itemDeleted, {notification : notification});
      var proxy = ItemProxy.getWorkingTree().getProxyFor(notification.id);
      proxy.deleteItem();
    });

    this.socketService.socket.on('Item/BulkUpdate', (bulkUpdate) => {
      this.logService.log(this.logEvents.bulkUpdate, {update : bulkUpdate});
      this.processBulkUpdate(bulkUpdate);
    });

    this.socketService.socket.on('VersionControl/statusUpdated', (gitStatusMap) => {
      this.logService.log(this.logEvents.versionControlStatusUpdated, {gitStatus : gitStatusMap});
      for (var id in gitStatusMap) {
        var proxy = ItemProxy.getWorkingTree().getProxyFor(id);
        this.updateStatus(proxy, gitStatusMap[id]);
      }
    });

    this.socketService.socket.on('connect_error', () => {
      this.logService.log(this.logEvents.socketError);
      this.repositoryStatus.next({
        state: RepoStates.DISCONNECTED,
        message: 'Error connecting to repository'
      })
    });

    this.socketService.socket.on('reconnect', () => {
      if (this.CurrentUserService.getCurrentUserSubject().getValue()) {
        this.logService.log(this.logEvents.socketReconnect);
        this.fetchItems();
        this.toastrService.success('Reconnected!', 'Server Connection!');
      } else {
        this.logService.log(this.logEvents.socketAuthenticating);
        let subscription: Subscription = this.CurrentUserService.getCurrentUserSubject()
          .subscribe((decodedToken) => {
            if (decodedToken) {
              this.logService.log(this.logEvents.socketAuthenticated);
              this.fetchItems();
              this.toastrService.success('Reconnected!', 'Server Connection!');
              subscription.unsubscribe();
            }

          });
      }
    });
  }

  processBulkUpdate(response) {
    this.logService.log(this.logEvents.processBulkUpdate);
    for (let kind in response.cache) {
      this.logService.log(this.logEvents.processBulkKind, {kind : kind});
      var kindList = response.cache[kind];
      for (var index in kindList) {
        let item = JSON.parse(kindList[index]);
        let iProxy;
        if (kind === 'KoheseModel') {
          iProxy = new KoheseModel(item);
        } else {
          try {
            iProxy = new ItemProxy(kind, item);
          } catch (error) {
            this.logService.log(this.logEvents.bulkError, {
              kind : kind,
              item : item,
              error : error
            })
          }
        }
      }
      if (kind === 'KoheseView') {
        KoheseModel.modelDefinitionLoadingComplete();
        this.repositoryStatus.next({
          state: RepoStates.KOHESEMODELS_SYNCHRONIZED,
          message: 'KoheseModels are available for use'
        });
      }
    }

    if (response.addItems) {
      response.addItems.forEach((addedItem) => {
        let iProxy;
        if (addedItem.kind === 'KoheseModel') {
          iProxy = new KoheseModel(addedItem.item);

        } else {
          iProxy = new ItemProxy(addedItem.kind, addedItem.item);
        }
      });
    }

    if (response.changeItems) {
      response.changeItems.forEach((changededItem) => {
        let iProxy;
        if (changededItem.kind === 'KoheseModel') {
          iProxy = new KoheseModel(changededItem.item);
        } else {
          iProxy = new ItemProxy(changededItem.kind, changededItem.item);
        }
      });
    }

    if (response.deleteItems) {
      response.deleteItems.forEach((deletedItemId) => {
        var proxy = ItemProxy.getWorkingTree().getProxyFor(deletedItemId);
        proxy.deleteItem();
      });
    }
  }

  cacheFetched: boolean = false;

  fetchItems() {

    // this.cacheFetched = true;
    // TODO Remove this
    if (!this.cacheFetched) {
      let beforeFetch = Date.now();

      this.repositoryStatus.next({
        state: RepoStates.SYNCHRONIZING,
        message: 'Starting Repository Sync'
      });

      CacheManager.sync((response) => {
        let afterFetch = Date.now();
        this.logService.log(this.logEvents.fetchTime ,{fetchTime : (afterFetch - beforeFetch) / 1000});

        if (response.metaModel) {
          this.logService.log(this.logEvents.processProxyMetaModel);
          this.processBulkUpdate({ cache: response.metaModel });
        }

        if (response.objectMap) {
          this.logService.log(this.logEvents.processCache);
          let itemCache = new ItemCache();
          itemCache.setObjectMap(response.objectMap);
          TreeConfiguration.setItemCache(itemCache);

          let workingTree = TreeConfiguration.getWorkingTree();
          let headCommit = itemCache.getRef('HEAD');
          this.logService.log(this.logEvents.retrieveHeadCommit, {headCommit : headCommit});

          // TODO Need to load the HEAD commit
          this.logService.log(this.logEvents.loadHeadCommit);
          itemCache.loadProxiesForCommit(headCommit, workingTree);
          workingTree.calculateAllTreeHashes();

          this.cacheFetched = true;
        }

        this.processBulkUpdate(response.allItems);

        let processingComplete = Date.now();
        this.logService.log(this.logEvents.bulkUpdateProcessingTime, {processTime : (processingComplete - afterFetch) / 1000});
        ItemProxy.getWorkingTree().loadingComplete();
        let treehashComplete = Date.now();
        this.logService.log(this.logEvents.treeHashProcessingTime, {processTime : (treehashComplete - processingComplete) / 1000});

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
    if (fetchAllStoredValue) {
      fetchAll = JSON.parse(fetchAllStoredValue);
    };
    this.logService.log(this.logEvents.fetchAll);

    if (fetchAll) {
      this.fetchAllItems(null);
    } else {
      this.logService.log(this.logEvents.fetchingAll);
      var beginFetching = Date.now();
      var origRepoTreeHashes = ItemProxy.getWorkingTree().getRepoTreeHashes();

      this.repositoryStatus.next({
        state: RepoStates.SYNCHRONIZING,
        message: 'Starting Repository Sync'
      });

      // this.logService.log('$$$ Client Repo THM');
      // this.logService.log(origRepoTreeHashes);

      this.socketService.socket.emit('Item/getRepoHashmap', { repoTreeHashes: origRepoTreeHashes }, (response) => {
        var gotResponse = Date.now();
        // this.logService.log('::: Response for getRepoHashmap');
        // this.logService.log('$$$ Response time: ' + (gotResponse-beginFetching)/1000);

        // this.logService.log('$$$ Server Repo THM');
        // this.logService.log(response);

        let repoSyncPending = false;

        for (let repoId in response.repoTreeHashes) {
          let repoTreeHash = response.repoTreeHashes[repoId];
          let repoProxy = ItemProxy.getWorkingTree().getProxyFor(repoId);
          let syncRequired = true;
          if (repoProxy && repoProxy.treeHashEntry) {
            // A previous fetch has occurried, check to see if there an opportunity to skip resync
            let rTHMCompare = TreeHashEntry.diff(repoTreeHash, repoProxy.treeHashEntry);
            if (rTHMCompare.match){
              syncRequired = false;
              // this.logService.log('$$$ Sync not required ' + repoId);
              this.repoSyncStatus[repoId] = RepoStates.SYNCHRONIZATION_SUCCEEDED;
            }
          }

          if (syncRequired) {
            this.fetchAllItems(repoId);
            this.repoSyncStatus[repoId] = RepoStates.SYNCHRONIZING;
            repoSyncPending = true;
          }
        }

        if (!repoSyncPending) {
          this.repositoryStatus.next({
            state: RepoStates.SYNCHRONIZATION_SUCCEEDED,
            message: 'Item Repository Ready'
          });
        }
      });
    }
  }

  fetchAllItems(forRepoId) {
    this.logService.log(this.logEvents.getAll);
    var beginFetching = Date.now();

    let origRepoTreeHashes;
    if (!forRepoId) {
      origRepoTreeHashes = ItemProxy.getWorkingTree().getAllTreeHashes()
    } else {
      let repoProxy = ItemProxy.getWorkingTree().getProxyFor(forRepoId);
      if (repoProxy) {
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
    this.logService.log(this.logEvents.repoSyncRequest, {request : request});

    this.socketService.socket.emit('Item/getAll', request, (response) => {
      var gotResponse = Date.now();
      this.logService.log(this.logEvents.getAllResponse, {
        response : response,
        processingTime : (gotResponse - beginFetching) / 1000,
      });
      var syncSucceeded = false;
      if (response.kdbMatches) {
        this.logService.log(this.logEvents.kdbSynced);
        syncSucceeded = true;
      } else {

        this.processBulkUpdate(response);

        this.logService.log(this.logEvents.compareHashAfterUpdate);
        var updatedTreeHashes;
        if (!forRepoId) {
          ItemProxy.getWorkingTree().loadingComplete();
          updatedTreeHashes = ItemProxy.getWorkingTree().getAllTreeHashes();
        } else {
          let repoProxy = ItemProxy.getWorkingTree().getProxyFor(forRepoId);
          if (repoProxy) {
            repoProxy.calculateRepoTreeHashes();
            updatedTreeHashes = repoProxy.getTreeHashMap();
          }
        }

        var compareAfterRTH = TreeHashMap.compare(updatedTreeHashes, response.repoTreeHashes);

        syncSucceeded = compareAfterRTH.match;

        var finishedTime = Date.now();
        this.logService.log(this.logEvents.compareTreeHashProcessingTime ,{ time : (finishedTime - gotResponse) / 1000});

        if (!compareAfterRTH.match) {
          this.logService.log(this.logEvents.repoSyncFailed, {compareAfterRTH : compareAfterRTH});
          let workingTree = TreeConfiguration.getWorkingTree();
          for (let idx in compareAfterRTH.changedItems) {
            let itemId = compareAfterRTH.changedItems[idx];
            let changedProxy = workingTree.getProxyFor(itemId);
            this.logService.log(this.logEvents.failedProxySync, {
              id : itemId,
              changedProxy : changedProxy
            });
          }
          this.repositoryStatus.next({
            state: RepoStates.SYNCHRONIZATION_FAILED,
            message: 'Repository sync failed'
          });
          if (forRepoId) {
            this.repoSyncStatus[forRepoId] = RepoStates.SYNCHRONIZATION_FAILED;
          }
        }
      }

      if (syncSucceeded) {
        if (forRepoId) {
          this.repoSyncStatus[forRepoId] = RepoStates.SYNCHRONIZATION_SUCCEEDED;

          let sendFinalSyncRequest = true;

          for (let repoId in this.repoSyncStatus) {
            if (this.repoSyncStatus[repoId] != RepoStates.SYNCHRONIZATION_SUCCEEDED) {
              this.logService.log(this.logEvents.waitingOnRepoSync, {repoId : repoId});
              sendFinalSyncRequest = false;
            }
          }

          if (sendFinalSyncRequest) {
            // All of the incremental syncs have succeeded, need to check for any new deltas
            this.fetchAllItems(null);
          }
        } else {
          // Final repo sync
          this.currentTreeConfigSubject.next({
            config: TreeConfiguration.getWorkingTree(),
            configType: TreeConfigType.DEFAULT
          });
          this.repositoryStatus.next({
            state: RepoStates.SYNCHRONIZATION_SUCCEEDED,
            message: 'Item Repository Ready'
          });

          var rootProxy = ItemProxy.getWorkingTree().getRootProxy();
          this.getStatusFor(rootProxy);
        }
      }
    });
  }

  fetchItem(proxy) {
    var promise = new Promise((resolve, reject) => {
      this.socketService.socket.emit('Item/findById', { id: proxy.item.id }, (response) => {
        proxy.updateItem(response.kind, response.item);
        proxy.dirty = false;
        resolve(proxy);
      });
    });

    return promise;
  }

  buildItem(kind: string, item: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.socketService.socket.emit('Item/upsert', { kind: kind, item: item }, (response) => {
        if (response.error) {
          this.logService.log(this.logEvents.createError, {error : response})
          reject(response.error);
        } else {
          this.logService.log(this.logEvents.createSuccess, {response : response});
          let proxy;
          if (response.kind === 'KoheseModel') {
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
          if (!proxy.updateItem) {
            // TODO Need to figure out why this is here
            proxy.item = response.item;

            if (response.kind === 'KoheseModel') {
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

  deleteItem(proxy, recursive) {
    this.logService.log(this.logEvents.deletingItem, {item : proxy , recursive : recursive});

    var promise = new Promise((resolve, reject) => {
      this.socketService.socket.emit('Item/deleteById', { kind: proxy.kind, id: proxy.item.id, recursive: recursive }, (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      });
    });

    return promise;
  }

  generateHTMLReportFor(proxy) {
    this.socketService.socket.emit('Item/generateReport', { onId: proxy.item.id, format: 'html' }, (results) => {
      this.logService.log(this.logEvents.generateHTMLReport, {response : results});
    });
  }

  generateDOCXReportFor(proxy) {
    this.socketService.socket.emit('Item/generateReport', { onId: proxy.item.id, format: 'docx' }, (results) => {
      this.logService.log(this.logEvents.generateDOCXReport, {response : results});
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

  getStatusFor(repo) {
    this.socketService.socket.emit('Item/getStatus', { repoId: repo.item.id }, (results) => {
      if (!repo.repoStatus) {
        repo.repoStatus = {};
      }
      repo.repoStatus = results;
      this.logService.log(this.logEvents.retrieveVCStatus, {repo : repo});
      for (var rIdx in repo.repoStatus) {
        var entry = repo.repoStatus[rIdx];
        this.logService.log(this.logEvents.retrieveVCStatus, {rIdx : rIdx, entry : entry});

        var proxy = ItemProxy.getWorkingTree().getProxyFor(entry.id);
        if (proxy) {
          this.updateStatus(proxy, entry.status);
        } else {
          this.logService.log(this.logEvents.retrieveVCStatusFailed, {rIdx : rIdx, entry : entry});
        }
      }
    });
  }

  performAnalysis(forProxy) {
    this.logService.log(this.logEvents.performingAnalysis, {proxy : forProxy});

    var promise = new Promise((resolve, reject) => {
      this.socketService.socket.emit('Item/performAnalysis', { kind: forProxy.kind, id: forProxy.item.id }, (response) => {
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

  getTreeConfig(): Observable<any> {
    return this.currentTreeConfigSubject;
  }

  setTreeConfig(treeId: string, configType: TreeConfigType): void {
    let treeConfiguration = TreeConfiguration.getTreeConfigFor(treeId);
    if (!treeConfiguration) {
      treeConfiguration = new TreeConfiguration(treeId);
      let itemCache = TreeConfiguration.getItemCache();
      itemCache.loadProxiesForCommit(treeId, treeConfiguration);
      treeConfiguration.loadingComplete();
    }

    this.currentTreeConfigSubject.next({
      config: treeConfiguration,
      configType: configType
    });
  }
}
