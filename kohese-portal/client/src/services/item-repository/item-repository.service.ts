
import { map} from 'rxjs/operators';
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

import { Subject ,  BehaviorSubject ,  Subscription ,  Observable, bindCallback } from 'rxjs';

import { LogService } from '../log/log.service';
import { InitializeLogs } from './item-repository.registry';
import { LocationMap } from '../../constants/LocationMap.data';
import { ReportSelection } from '../../classes/ReportSelection.class';

export enum RepoStates {
  DISCONNECTED,
  SYNCHRONIZING,
  SYNCHRONIZATION_FAILED,
  KOHESEMODELS_SYNCHRONIZED,
  SYNCHRONIZATION_SUCCEEDED
}

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
  private static loggingInitialized: boolean = false;
  private static componentId: number;
  private static itemRepoInitEvent: number;

  shortProxyList: Array<ItemProxy>;
  modelTypes: Object;
  private _repoState: RepoStates = undefined;

  logEvents: any;


  recentProxies: Array<ItemProxy>;
  state: any;

  repositoryStatus: BehaviorSubject<any>;
  repoSyncStatus = {};

  currentTreeConfigSubject: BehaviorSubject<TreeConfigInfo> = new BehaviorSubject<TreeConfigInfo>(undefined);

  private _worker: SharedWorker.SharedWorker;
  private _cache: ItemCache = new ItemCache();
  private _initialized: boolean = false;
  private _initialWorkingTreeNotificationSent = false;

  private _suppressWorkerRequestAnnouncement = {
    connectionVerification: true
  };

  private _suppressWorkerEventAnnouncement = {
    verifyConnection: true
  };


  //////////////////////////////////////////////////////////////////////////
  constructor(private socketService: SocketService,
    private CurrentUserService: CurrentUserService,
    private toastrService: ToastrService,
    private dialogService: DialogService,
    private _versionControlService: VersionControlService,
    private logService: LogService) {
    this.logEvents = InitializeLogs(logService)
    this.logService.log(this.logEvents.itemRepoInit);


    this._repoState = RepoStates.DISCONNECTED;
    this.repositoryStatus = new BehaviorSubject({
      state: this._repoState,
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
            if (attribute.value.match(/^scripts/)) {
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

      let msg: any = messageEvent.data;

      if (!msg.message){

        if (msg.id && msg.data) {
          // Ignore response that is directed to another event listener
          // console.log('^^^ Received response from worker in main listener for request: ' + msg.id);
        } else {
          console.log('*** Received unexpected response message');
          console.log(messageEvent);
        }
        return;
      }

      let beforeProcessing = Date.now();
      if (!this._suppressWorkerEventAnnouncement[msg.message]){
        console.log('^^^ Received message from worker: ' + msg.message);
      }

      switch (msg.message) {
        case 'reconnected':
          this.align();
          break;
        case 'connectionError':

          // TODO: Should only send the state changes once

          this.updateRepositorySyncState(
            RepoStates.DISCONNECTED,
            'Disconnected'
          );

          break;
        case 'verifyConnection':
          this.sendMessageToWorker('connectionVerification', undefined, false);
          break;
        case 'update':
          this.buildOrUpdateProxy(msg.data.item, msg.data.kind, msg.data.status);
          break;
        case 'updateItemStatus':
          this.updateItemStatus(msg.data.itemId, msg.data.status);
          break;
        case 'deletion':
          TreeConfiguration.getWorkingTree().getProxyFor(msg.data.id).
            deleteItem(msg.data.recursive);
          break;
        case 'cachePiece':
          const cachePiece: any = msg.data;
          this.processCachePiece(cachePiece);
          break;
        default:
          console.log('*** Received unexpected message: ' + msg.message);
          console.log(messageEvent);
      }

      if (!this._suppressWorkerEventAnnouncement[msg.message]){
        let afterProcessing = Date.now();
        console.log('^^^ Processed message from worker ' + msg.message + ' - '
          + (afterProcessing - beforeProcessing) / 1000);
      }
    });

    TreeConfiguration.setItemCache(this._cache);
    this._worker.port.start();

    this.CurrentUserService.getCurrentUserSubject()
      .subscribe((decodedToken) => {
      this.logService.log(this.logEvents.itemRepositoryAuthenticated);
      if (decodedToken) {
        this.logService.log(this.logEvents.socketAlreadyConnected);
        this.updateRepositorySyncState(
          RepoStates.SYNCHRONIZING,
          'Starting Repository Sync'
        );
        this.sendMessageToWorker('connect', localStorage.getItem('auth-token'),
          true).then(async () => {
          this.align();
        });
      }
    });
  }

  public async getSessionMap(): Promise<any> {
    return (await this.sendMessageToWorker('getSessionMap', undefined, true)).
      data;
  }

  private align(): Promise<void> {
    return new Promise<void>(async (resolve: () => void, reject: () => void) => {
      this.updateRepositorySyncState(
        RepoStates.SYNCHRONIZING,
        'Starting Repository Sync'
      );

      let workingTree: TreeConfiguration = TreeConfiguration.getWorkingTree();

      if (!this._initialized) {
        const fundamentalItemsResponse = await this.sendMessageToWorker(
          'getFundamentalItems', { refresh: false }, true);
        this.processBulkUpdate(fundamentalItemsResponse.data);

        await this.sendMessageToWorker('getCache', { refresh: false }, true);

        const headRef = await this._cache.getRef('HEAD');
        await this._cache.loadProxiesForCommit(headRef, workingTree);

        workingTree.calculateAllTreeHashes();
      }

      const treeHashes = workingTree.getAllTreeHashes();

      const itemUpdatesResponse = await this.sendMessageToWorker(
        'getItemUpdates', { refresh: false, treeHashes: treeHashes }, true);
      this.processBulkUpdate(itemUpdatesResponse.data);

      // Ensure status for all items is updated
      const statusResponse = await this.sendMessageToWorker(
        'getStatus', undefined, true);
      console.log('^^^ Received status update with count of: ' + statusResponse.data.statusCount);

      const calculateTreeHashesAsynchronously: boolean = this.loadFeatureSwitch(
        'IR-defer-calc', true);

      if (!this._initialized) {
        if (calculateTreeHashesAsynchronously) {

          console.log('^^^ Calculating TreeHashes asynchronously');

          // Send early notification to other components
          this.currentTreeConfigSubject.next({
            config: workingTree,
            configType: TreeConfigType.DEFAULT
          });

          this._initialWorkingTreeNotificationSent = true;

          this.updateRepositorySyncState(
            RepoStates.SYNCHRONIZATION_SUCCEEDED,
            'Item Repository Ready'
          );

          await Promise.all(workingTree.loadingComplete(calculateTreeHashesAsynchronously));

          console.log('^^^ Completed calculating TreeHashes asynchronously');

        } else {

          console.log('^^^ Calculating TreeHashes synchronously');

          // This call will block until complete since the TreeHash processing is not deferred
          await Promise.all(workingTree.loadingComplete(false));

        }
      }

      if (this._initialized){
        console.log('^^^ Requesting re-sync');
      } else {
        console.log('^^^ Requesting second sync');
        this._initialized = true;
      }

      let secondItemUpdateResponse = await this.sendMessageToWorker(
        'getItemUpdates', { refresh: true, treeHashes: workingTree.getAllTreeHashes() }, true);

      let syncIsComplete = secondItemUpdateResponse.data.kdbMatches;

      if (syncIsComplete){
        this.logService.log(this.logEvents.kdbSynced);
      } else {
        // Process the updates
        this.processBulkUpdate(secondItemUpdateResponse.data);

        this.logService.log(this.logEvents.compareHashAfterUpdate);

        let updatedTreeHashes = workingTree.getAllTreeHashes();

        let compareRTH = TreeHashMap.compare(updatedTreeHashes, secondItemUpdateResponse.data.repoTreeHashes);

        syncIsComplete = compareRTH.match

        if (!syncIsComplete) {
          // Provide additional logging information for failure to sync
          this.logService.log(this.logEvents.repoSyncFailed, {comparison : compareRTH});

          for (let idx in compareRTH.changedItems) {
            let itemId = compareRTH.changedItems[idx];
            let changedProxy = workingTree.getProxyFor(itemId);
            this.logService.log(this.logEvents.failedProxySync, {
              id : itemId,
              changedProxy : changedProxy
            });
          }
        }
      }

      // Provide notification of final status

      if (syncIsComplete) {
        if (!this._initialWorkingTreeNotificationSent) {
          // Notify tree is ready to use
          this.currentTreeConfigSubject.next({
            config: workingTree,
            configType: TreeConfigType.DEFAULT
          });
          this._initialWorkingTreeNotificationSent = true;
        }

        this.updateRepositorySyncState(
          RepoStates.SYNCHRONIZATION_SUCCEEDED,
          'Item Repository Ready'
        );
      } else {
        this.updateRepositorySyncState(
          RepoStates.SYNCHRONIZATION_FAILED,
          'Repository sync failed'
        );
      }

      resolve();
    });
  }

  //////////////////////////////////////////////////////////////////////////
  private updateRepositorySyncState(repoState: RepoStates, message: string) {
    if (repoState !== this._repoState) {
      console.log('^^^ Update Repo State: ' + repoState + ' - ' + message);
        this.repositoryStatus.next({
          state: repoState,
          message: message
        });
        this._repoState = repoState;
    } else {
      console.log('^^^ Repo state is already: ' + repoState + ' - ' + message);
    }
  }

  //////////////////////////////////////////////////////////////////////////
  private buildOrUpdateProxy(item: any, kind: string, itemStatus: Array<string>):
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

    if (proxy && itemStatus) {
      proxy.updateVCStatus(itemStatus);

      TreeConfiguration.getWorkingTree().getChangeSubject().next({
        type: 'update',
        proxy: proxy
      });
    }

    return proxy;
  }

  //////////////////////////////////////////////////////////////////////////
  updateItemStatus (itemId : string, itemStatus : Array<string>) {

    let workingTree = ItemProxy.getWorkingTree();
    let proxy: ItemProxy = workingTree.getProxyFor(itemId);

    if (proxy && itemStatus) {
      console.log('^^^ Updating status for: ' + itemId + ' - ' + itemStatus);
      proxy.updateVCStatus(itemStatus);

      // TODO: All change notifications need to be sent from ItemProxy

      TreeConfiguration.getWorkingTree().getChangeSubject().next({
        type: 'update',
        proxy: proxy
      });
    } else {
      console.log('*** Could not find proxy to update status: ' + itemId + ' - ' + itemStatus);
    }

  }

  //////////////////////////////////////////////////////////////////////////
  getRepoStatusSubject(): BehaviorSubject<any> {
    return this.repositoryStatus;
  }

  //////////////////////////////////////////////////////////////////////////
  registerRecentProxy(itemProxy: ItemProxy) {
    let recentProxyIndex: number = this.recentProxies.indexOf(itemProxy);
    if (recentProxyIndex !== -1) {
      this.recentProxies.splice(recentProxyIndex, 1);
    }

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
  processCachePiece(cachePiece) {

    switch (cachePiece.key) {
      case 'metadata':
        for (let key in cachePiece.value) {
          this._cache.cacheMetaData(key, cachePiece.value[key]);
        }
        break;
      case 'ref':
        for (let key in cachePiece.value) {
          this._cache.cacheRef(key, cachePiece.value[key]);
        }
        break;
      case 'tag':
        for (let key in cachePiece.value) {
          this._cache.cacheTag(key, cachePiece.value[key]);
        }
        break;
      case 'commit':
        for (let key in cachePiece.value) {
          this._cache.cacheCommit(key, cachePiece.value[key]);
        }
        break;
      case 'tree':
        for (let key in cachePiece.value) {
          this._cache.cacheTree(key, cachePiece.value[key]);
        }
        break;
      case 'blob':
        for (let key in cachePiece.value) {
          this._cache.cacheBlob(key, cachePiece.value[key]);
        }
        break;
    }
  }

  //////////////////////////////////////////////////////////////////////////
  processBulkUpdate(response) {
    this.logService.log(this.logEvents.processBulkUpdate);
    for (const kind in response.cache) {
      this.logService.log(this.logEvents.processBulkKind, {kind : kind});
      const kindList = response.cache[kind];
      for (const index in kindList) {
        const item = JSON.parse(kindList[index]);
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
        this.updateRepositorySyncState(
          RepoStates.KOHESEMODELS_SYNCHRONIZED,
          'KoheseModels are available for use'
        );
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
        if (proxy) {
          proxy.deleteItem(false);
        }
      });
    }
  }

  private sendMessageToWorker(message: string, data: any, expectResponse:
    boolean): Promise<any> {
    return new Promise<void>((resolve: (data: any) => void, reject:
      () => void) => {

      let requestTime = Date.now();
      let id: number = requestTime;

      if (!this._suppressWorkerRequestAnnouncement[message]) {
        console.log('^^^ Send message to worker: ' + message + ' - ' + id);
      }

      if (expectResponse) {
        let responseHandler: (messageEvent: any) => void = (messageEvent:
          any) => {
          let msg: any = messageEvent.data;
          if (msg.id === id) {
            let responseTime = Date.now();
            console.log('^^^ Received response from worker for request: ' + message + ' - ' + msg.id + ' - ' +
              (responseTime-requestTime)/1000);
            resolve(msg);
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

  public buildReport(reportName: string, reportSelections: Array<ReportSelection>, linkToItems:
    boolean): string {
    let content: string = '';
    let userName: any = this.CurrentUserService.getCurrentUserSubject().
      getValue();
    let date = new Date();
    content += 'Report Name: ' + reportName + '\n\n';
    content += 'User Name: ' + userName.username + '\n\n';
    content += 'Creation Date: ' + date + '\n\n';
    for (let j: number = 0; j < reportSelections.length; j++) {
      let reportSelection: ReportSelection = reportSelections[j];
      if (reportSelection.includeDescendants) {
        reportSelection.itemProxy.visitTree(undefined, (itemProxy:
          ItemProxy) => {
          let depth: number = itemProxy.getDepthFromAncestor(reportSelection.
            itemProxy) + 1;
          for (let j: number = 0; j < depth; j++) {
            content += '#';
          }

          content += this.getItemReportText(itemProxy.item, linkToItems);
        });
      } else {
        content += '#';
        content += this.getItemReportText(reportSelections[j].itemProxy.item,
          linkToItems);
      }
    }
    return content;
  }

  private getItemReportText(item: any, linkToItems: boolean): string {
    if (linkToItems) {
      return ' [' + item.name + '](' + window.location.origin +
        LocationMap['Explore'].route + ';id=' + item.id + ')\n\n' + (item.
        description ? item.description : '') + '\n\n';
    } else {
      return ' ' + item.name + '\n\n' + (item.description ? item.
        description : '') + '\n\n';
    }
  }

  public async produceReport(report: string, reportName: string, format:
    string): Promise<void> {
    return await this.sendMessageToWorker('produceReport', {
      reportName: reportName,
      format: format,
      content: report
    }, true);
  }

  public async getReportMetaData(): Promise<Array<any>> {
    return (await this.sendMessageToWorker('getReportMetaData', {}, true)).data;
  }

  public async renameReport(oldReportName: string, newReportName: string):
    Promise<void> {
    return await this.sendMessageToWorker('renameReport',
      { oldReportName: oldReportName, newReportName: newReportName }, true);
  }

  public async getReportPreview(reportName: string): Promise<string> {
    return (await this.sendMessageToWorker('getReportPreview',
      { reportName: reportName }, true)).data;
  }

  public async removeReport(reportName: string): Promise<void> {
    return await this.sendMessageToWorker('removeReport',
      { reportName: reportName }, true);
  }

  //////////////////////////////////////////////////////////////////////////
  public getHistoryFor(proxy: ItemProxy): Observable<Array<any>> {
    let emitReturningObservable: (message: string, data: any) => Observable<any> =
      bindCallback(this.socketService.getSocket().emit.bind(this.
        socketService.getSocket()));
    return emitReturningObservable('Item/getHistory', { onId: proxy.item.id }).pipe(
      map((response: any) => {
        proxy.history = response.history;
        /* Return a copy of the history so that subscribers may modify the
        returned history, if desired. */
        return JSON.parse(JSON.stringify(proxy.history));
      }));
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
  async setTreeConfig(treeId: string, configType: TreeConfigType): Promise<void> {
    let treeConfiguration = TreeConfiguration.getTreeConfigFor(treeId);
    if (!treeConfiguration) {
      treeConfiguration = new TreeConfiguration(treeId);
      let itemCache = TreeConfiguration.getItemCache();
      await itemCache.loadProxiesForCommit(treeId, treeConfiguration);
      treeConfiguration.loadingComplete();
    }

    this.currentTreeConfigSubject.next({
      config: treeConfiguration,
      configType: configType
    });
  }
}
