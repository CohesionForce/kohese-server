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

  private _worker: SharedWorker.SharedWorker;
  private _cache: ItemCache = new ItemCache();

  //////////////////////////////////////////////////////////////////////////
  constructor(private socketService: SocketService,
    private CurrentUserService: CurrentUserService,
    private toastrService: ToastrService,
    private dialogService: DialogService,
    private _versionControlService: VersionControlService,
    private logService: LogService) {
    this.logEvents = InitializeLogs(logService)
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

    this.recentProxies = [];

    let scripts: any = document.scripts;
    let cacheWorkerBundle: string;
    scriptLoop: for (let scriptIdx in scripts) {
      let script: any = scripts[scriptIdx];
      if (script.attributes) {
        for (let idx in script.attributes) {
          let attribute: any = script.attributes[idx];
          if (attribute.value) {
            if (attribute.value.match(/^cache-worker/)) {
              cacheWorkerBundle = attribute.value;
              break scriptLoop;
            }
          }
        }
      }
    }
    console.log('::: Using cache worker bundle: ' + cacheWorkerBundle);
    this._worker = new SharedWorker(cacheWorkerBundle);
    this._worker.port.addEventListener('message', (messageEvent: any) => {
      let data: any = messageEvent.data;
      switch (data.message) {
        case 'reconnected':
          this.align();
          break;
        case 'connectionError':
          this.repositoryStatus.next({
            state: RepoStates.DISCONNECTED,
            message: 'Disconnected'
          });
          break;
        case 'update':
          this.buildOrUpdateProxy(data.data.item, data.data.kind, data.data.
            status);
          break;
        case 'deletion':
          TreeConfiguration.getWorkingTree().getProxyFor(data.data).
            deleteItem();
          break;
        case 'cachePiece':
          let updateData: any = data.data;
          switch (updateData.key) {
            case 'metadata':
              for (let key in updateData.value) {
                this._cache.cacheMetaData(key, updateData.value[key]);
              }
              break;
            case 'ref':
              for (let key in updateData.value) {
                this._cache.cacheRef(key, updateData.value[key]);
              }
              break;
            case 'tag':
              for (let key in updateData.value) {
                this._cache.cacheTag(key, updateData.value[key]);
              }
              break;
            case 'commit':
              for (let key in updateData.value) {
                this._cache.cacheCommit(key, updateData.value[key]);
              }
              break;
            case 'tree':
              for (let key in updateData.value) {
                this._cache.cacheTree(key, updateData.value[key]);
              }
              break;
            case 'blob':
              for (let key in updateData.value) {
                this._cache.cacheBlob(key, updateData.value[key]);
              }
              break;
          }
          break;
      }
    });
    TreeConfiguration.setItemCache(this._cache);
    this._worker.port.start();

    this.CurrentUserService.getCurrentUserSubject()
      .subscribe((decodedToken) => {
      this.logService.log(this.logEvents.itemRepositoryAuthenticated);
      if (decodedToken) {
        this.logService.log(this.logEvents.socketAlreadyConnected);
        this.sendMessageToWorker('connect', localStorage.getItem('auth-token'),
          true).then(async () => {
          this.align();
        });
      }
    });
  }

  private align(): Promise<void> {
    return new Promise<void>(async (resolve: () => void, reject:
      () => void) => {
      this.repositoryStatus.next({
        state: RepoStates.SYNCHRONIZING,
        message: 'Starting Repository Sync'
      });
      this.processBulkUpdate((await this.sendMessageToWorker(
        'getFundamentalItems', { refresh: false }, true)).data);
      await this.sendMessageToWorker('getCache', { refresh: false }, true);
      let workingTree: TreeConfiguration = TreeConfiguration.getWorkingTree();
      this._cache.loadProxiesForCommit(this._cache.getRef('HEAD'),
        workingTree);
      this.processBulkUpdate((await this.sendMessageToWorker('getItemUpdates',
        { refresh: false, treeHashes: undefined }, true)).data);
      let calculateTreeHashesAsynchronously: boolean = this.loadFeatureSwitch(
        'IR-defer-calc', true);
      if (calculateTreeHashesAsynchronously) {
        this.currentTreeConfigSubject.next({
          config: workingTree,
          configType: TreeConfigType.DEFAULT
        });
        this.repositoryStatus.next({
          state: RepoStates.SYNCHRONIZATION_SUCCEEDED,
          message: 'Item Repository Ready'
        });
      }

      await Promise.all(workingTree.loadingComplete(
        calculateTreeHashesAsynchronously));
      this.processBulkUpdate((await this.sendMessageToWorker('getItemUpdates',
        { refresh: true,treeHashes: workingTree.getAllTreeHashes() }, true)).data);
      if (!calculateTreeHashesAsynchronously) {
        this.currentTreeConfigSubject.next({
          config: workingTree,
          configType: TreeConfigType.DEFAULT
        });
        this.repositoryStatus.next({
          state: RepoStates.SYNCHRONIZATION_SUCCEEDED,
          message: 'Item Repository Ready'
        });
      }

      resolve();
    });
  }

  private buildOrUpdateProxy(item: any, kind: string, status: Array<string>):
    ItemProxy {
    let proxy: ItemProxy = TreeConfiguration.getWorkingTree().getProxyFor(item.
      id);
    if (kind) {
      if (proxy) {
        proxy.updateItem(kind, item);
        proxy.dirty = false;
      } else {
        if (kind === 'KoheseModel') {
          proxy = new KoheseModel(item);
        } else {
          proxy = new ItemProxy(kind, item);
        }
      }
    }

    if (status && proxy) {
      proxy.status.length = 0;
      proxy.status.push(...status);

      TreeConfiguration.getWorkingTree().getChangeSubject().next({
        type: 'update',
        proxy: proxy
      });
    }

    return proxy;
  }

  //////////////////////////////////////////////////////////////////////////
  getRepoStatusSubject(): BehaviorSubject<any> {
    return this.repositoryStatus;
  }

  //////////////////////////////////////////////////////////////////////////
  registerRecentProxy(itemProxy: ItemProxy) {
    this.recentProxies.push(itemProxy);
  }

  //////////////////////////////////////////////////////////////////////////
  getRecentProxies(): Array<ItemProxy> {
    return this.recentProxies;
  }

  //////////////////////////////////////////////////////////////////////////
  createFeatureSwitch(featureName, defaultValue){

    let storedValue = localStorage.getItem(featureName)

    if (!storedValue) {
      this.setFeatureSwitch(featureName, defaultValue);
    };

  }

  //////////////////////////////////////////////////////////////////////////
  setFeatureSwitch(featureName, value){

    localStorage.setItem(featureName, JSON.stringify(value));

  }

  //////////////////////////////////////////////////////////////////////////
  loadFeatureSwitch(featureName, defaultValue){

    let switchResult = defaultValue;

    let storedValue = localStorage.getItem(featureName)

    if (storedValue) {
      switchResult = JSON.parse(storedValue);
    } else {
      this.createFeatureSwitch(featureName, defaultValue);
    };

    return switchResult
  }

  //////////////////////////////////////////////////////////////////////////
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

  private sendMessageToWorker(message: string, data: any, expectResponse:
    boolean): Promise<any> {
    return new Promise<void>((resolve: (data: any) => void, reject:
      () => void) => {
      let id: number = Date.now();
      if (expectResponse) {
        let responseHandler: (messageEvent: any) => void = (messageEvent:
          any) => {
          let data: any = messageEvent.data;
          if (data.id === id) {
            resolve(data);
            this._worker.port.removeEventListener('message',
              responseHandler);
          }
        };
        this._worker.port.addEventListener('message', responseHandler);
      }
      this._worker.port.postMessage({
        type: message,
        id: id,
        data: data
      });
      this._worker.port.start();
      if (!expectResponse) {
        resolve(undefined);
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

  //////////////////////////////////////////////////////////////////////////
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

  //////////////////////////////////////////////////////////////////////////
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

  //////////////////////////////////////////////////////////////////////////
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

  //////////////////////////////////////////////////////////////////////////
  generateHTMLReportFor(proxy) {
    this.socketService.socket.emit('Item/generateReport', { onId: proxy.item.id, format: 'html' }, (results) => {
      this.logService.log(this.logEvents.generateHTMLReport, {response : results});
    });
  }

  //////////////////////////////////////////////////////////////////////////
  generateDOCXReportFor(proxy) {
    this.socketService.socket.emit('Item/generateReport', { onId: proxy.item.id, format: 'docx' }, (results) => {
      this.logService.log(this.logEvents.generateDOCXReport, {response : results});
    });
  }

  //////////////////////////////////////////////////////////////////////////
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

  //////////////////////////////////////////////////////////////////////////
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

  //////////////////////////////////////////////////////////////////////////
  getTreeConfig(): Observable<any> {
    return this.currentTreeConfigSubject;
  }

  //////////////////////////////////////////////////////////////////////////
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
