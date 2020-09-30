
import { map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import * as _ from 'underscore';
import { MarkdownService } from 'ngx-markdown';

import { SocketService } from '../socket/socket.service';
import { CurrentUserService } from '../user/current-user.service';
import { ToastrService } from 'ngx-toastr';
import { DialogService } from '../dialog/dialog.service';
import { VersionControlService } from '../version-control/version-control.service';

import { FormatDefinition,
  FormatDefinitionType } from '../../../../common/src/FormatDefinition.interface';
import { FormatContainer,
  FormatContainerKind } from '../../../../common/src/FormatContainer.interface';
import { PropertyDefinition } from '../../../../common/src/PropertyDefinition.interface';
import { TableDefinition } from '../../../../common/src/TableDefinition.interface';
import { LocationMap } from '../../constants/LocationMap.data';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { TreeHashMap, TreeHashEntry } from '../../../../common/src/tree-hash';
import { ItemCache } from '../../../../common/src/item-cache';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { KoheseModel } from '../../../../common/src/KoheseModel';

import { Subject ,  BehaviorSubject ,  Subscription ,  Observable, bindCallback } from 'rxjs';

import { LogService } from '../log/log.service';
import { InitializeLogs } from './item-repository.registry';
import { Metatype } from '../../../../common/src/Type.interface';
import { EnumerationValue } from '../../../../common/src/Enumeration.interface';
import { KoheseDataModel,
  KoheseViewModel } from '../../../../common/src/KoheseModel.interface';

export enum RepoStates {
  DISCONNECTED,
  USER_LOCKED_OUT,
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
  private static markdownNormalizationEnabled =
    ItemRepository.loadFeatureSwitch('IR-markdown-normalization-enabled', false);

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
    private logService: LogService, private _markdownService:
    MarkdownService) {
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

    // Set up the worker messaging
    this._worker.port.addEventListener('message', (messageEvent: any) => {

      let msg: any = messageEvent.data;

      if (!msg.message){

        if (msg.id) {
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
          this.sync();
          break;
        case 'connectionError':

          // TODO: Should only send the state changes once

          this.updateRepositorySyncState(
            RepoStates.DISCONNECTED,
            'Disconnected'
          );

          break;

        case 'userLockedOut':

          this.updateRepositorySyncState(
            RepoStates.USER_LOCKED_OUT,
            'User is locked out'
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
          TreeConfiguration.getWorkingTree().getProxyFor(msg.data.id).deleteItem();
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

    // Try to notify cacheWorker if the tab is closing
    addEventListener( 'unload', () => {
      this.sendMessageToWorker('tabIsClosing', undefined, false)
    });

    // Establish the Item Repository
    ItemCache.setItemCache(this._cache);
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
          this.sync();
        });
      }
    });
  }

  //////////////////////////////////////////////////////////////////////////
  static createFeatureSwitch(featureName, defaultValue){

    let storedValue = localStorage.getItem(featureName)

    if (!storedValue) {
      ItemRepository.setFeatureSwitch(featureName, defaultValue);
    };

  }

  //////////////////////////////////////////////////////////////////////////
  static setFeatureSwitch(featureName, value){

    localStorage.setItem(featureName, JSON.stringify(value));

  }

  //////////////////////////////////////////////////////////////////////////
  static loadFeatureSwitch(featureName, defaultValue){

    let switchResult = defaultValue;

    let storedValue = localStorage.getItem(featureName)

    if (storedValue) {
      switchResult = JSON.parse(storedValue);
    } else {
      ItemRepository.createFeatureSwitch(featureName, defaultValue);
    };

    return switchResult
  }

  public async getSessionMap(): Promise<any> {
    return (await this.sendMessageToWorker('getSessionMap', undefined, true)).
      data;
  }

  private sync(): Promise<void> {
    return new Promise<void>(async (resolve: () => void, reject: () => void) => {
      this.updateRepositorySyncState(
        RepoStates.SYNCHRONIZING,
        'Starting Repository Sync'
      );

      let workingTree: TreeConfiguration = TreeConfiguration.getWorkingTree();

      let beforeSync = Date.now();
      let afterLoadWorking;
      let afterCalcTreeHashes;

      if (!this._initialized) {
        const fundamentalItemsResponse = await this.sendMessageToWorker(
          'getFundamentalItems', { refresh: false }, true);
        this.processBulkUpdate(fundamentalItemsResponse.data);

        let afterSyncMetaModels = Date.now();
        console.log('^^^ Time to getMetaModels: ' + (afterSyncMetaModels - beforeSync) / 1000);

        await this.sendMessageToWorker('getCache', { refresh: false }, true);

        let afterSyncCache = Date.now();
        console.log('^^^ Time to getItemCache: ' + (afterSyncCache - afterSyncMetaModels) / 1000);

        const workingWorkspace = await this._cache.getWorkspace('Working');

        if (workingWorkspace) {
          console.log('^^^ Loading Working')
          await this._cache.loadProxiesForTreeRoots(workingWorkspace, workingTree);
          afterLoadWorking = Date.now();
          console.log('^^^ Time to load Working: ' + (afterLoadWorking - afterSyncCache) / 1000);

        } else {
          console.log('^^^ Loading HEAD')
          const headRef = await this._cache.getRef('HEAD');
          await this._cache.loadProxiesForCommit(headRef, workingTree);

          afterLoadWorking = Date.now();
          console.log('^^^ Time to load HEAD: ' + (afterLoadWorking - afterSyncCache) / 1000);
        }

        await workingTree.loadingComplete();
        this._initialized = true;

        afterCalcTreeHashes = Date.now();

      } else {
        afterLoadWorking = Date.now();
        afterCalcTreeHashes = Date.now();
      }

      console.log('^^^ Time to calc treehashes: ' + (afterCalcTreeHashes - afterLoadWorking) / 1000);

      const treeHashes = workingTree.getAllTreeHashes();

      console.log('^^^ Requesting item updates');
      const itemUpdatesResponse = await this.sendMessageToWorker(
        'getItemUpdates', { refresh: false, treeHashes: treeHashes }, true);
      this.processBulkUpdate(itemUpdatesResponse.data);

      let afterGetAll = Date.now();
      console.log('^^^ Time to get and load deltas: ' + (afterGetAll - afterCalcTreeHashes) / 1000);

      // Ensure status for all items is updated
      console.log('^^^ Getting status');
      const statusResponse = await this.sendMessageToWorker(
        'getStatus', undefined, true);
      statusResponse.data.idStatusArray.forEach(element => {
        this.updateItemStatus(element.id, element.status);
      });
      console.log('^^^ Received status update with count of: ' + statusResponse.data.statusCount);

      let afterGetStatus = Date.now();
      console.log('^^^ Time to get status: ' + (afterGetStatus - afterGetAll) / 1000);

      // TODO: Need to determine if second update is required

      let secondItemUpdateResponse = await this.sendMessageToWorker(
        'getItemUpdates', { refresh: true, treeHashes: workingTree.getAllTreeHashes() }, true);

      let afterLoading = Date.now();
      console.log('^^^ Time to perform second sync: ' + (afterLoading - afterGetStatus) / 1000);
      console.log('^^^ Total time to sync: ' + (afterLoading - beforeSync) / 1000);

      let syncIsComplete = secondItemUpdateResponse.data.kdbMatches;

      if (syncIsComplete){
        this.logService.log(this.logEvents.kdbSynced);
      } else {
        // Process the updates
        this.processBulkUpdate(secondItemUpdateResponse.data);

        this.logService.log(this.logEvents.compareHashAfterUpdate);

        let updatedTreeHashes = workingTree.getAllTreeHashes();

        let diffRTH = TreeHashMap.diff(updatedTreeHashes, secondItemUpdateResponse.data.repoTreeHashes);

        syncIsComplete = diffRTH.match

        if (!syncIsComplete) {
          // Provide additional logging information for failure to sync
          this.logService.log(this.logEvents.repoSyncFailed, {diff : diffRTH});

          for (let itemId in diffRTH.summary.contentChanged) {
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

    if (itemStatus) {
      if (!proxy) {
        console.log('+++ Creating lost-item for missing proxy to update status: ' + itemId + ' - ' + itemStatus);
        // TODO: Need to evaluate and remove the creation of missing proxies from this location
        proxy = ItemProxy.createMissingProxy('Item','id', itemId, workingTree);

      }

      console.log('^^^ Updating status for: ' + itemId + ' - ' + itemStatus);
      proxy.updateVCStatus(itemStatus);

      // TODO: All change notifications need to be sent from ItemProxy

      TreeConfiguration.getWorkingTree().getChangeSubject().next({
        type: 'update',
        proxy: proxy
      });
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

    // Add the recent proxy to the front of list
    this.recentProxies.unshift(itemProxy);
  }

  //////////////////////////////////////////////////////////////////////////
  getRecentProxies(): Array<ItemProxy> {
    return this.recentProxies;
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
      case 'workspace':
        for (let key in cachePiece.value) {
          this._cache.cacheWorkspace(key, cachePiece.value[key]);
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

  public async getIcons(): Promise<Array<string>> {
    return (await this.sendMessageToWorker('getIcons', {}, true)).data;
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
  public async upsertItem(type: string, item: any): Promise<ItemProxy> {
    if (ItemRepository.markdownNormalizationEnabled){
      for (let attributeName in item) {
        // The itemIds attribute is currently absent from classProperties.
        if (attributeName !== 'itemIds') {
          let isMarkdownAttribute: boolean = false;
          let dataModelItemProxy: ItemProxy = TreeConfiguration.getWorkingTree().
            getProxyFor(type);
          if (dataModelItemProxy.item.classProperties[attributeName].definition.
            type === 'markdown') {
            isMarkdownAttribute = true;
          } else {
            let viewModelItemProxy: ItemProxy = TreeConfiguration.
              getWorkingTree().getProxyFor('view-' + dataModelItemProxy.item.
              name.toLowerCase());
            // Currently, not every data model has a view model.
            if (!viewModelItemProxy) {
              viewModelItemProxy = TreeConfiguration.getWorkingTree().
                getProxyFor('view-item');
            }

            let viewModelAttribute: any = viewModelItemProxy.item.viewProperties[
              attributeName];
            if (viewModelAttribute && viewModelAttribute.inputType.type ===
              'markdown') {
              isMarkdownAttribute = true;
            }
          }

          if (isMarkdownAttribute) {
            item[attributeName] = await this.convertToMarkdown(this.
              _markdownService.compile(item[attributeName]), 'text/html', {});
          }
        }
      }
    }

    return new Promise<ItemProxy>((resolve: ((value: ItemProxy) => void),
      reject: ((value: any) => void)) => {
      this.socketService.getSocket().emit('Item/upsert', {
        kind: type,
        item: item
      }, (response: any) => {
        if (response.error) {
          this.dialogService.openInformationDialog('Error', 'An error ' +
            'occurred while saving ' + item.name + '.');
          reject(response.error);
        } else {
          let proxy: ItemProxy;
          if (!item.id) {
            if (type === 'KoheseModel') {
              proxy = new KoheseModel(response.item);
            } else {
              proxy = new ItemProxy(response.kind, response.item);
            }
          } else {
            proxy = TreeConfiguration.getWorkingTree().getProxyFor(item.id);
            proxy.updateItem(response.kind, response.item);
            proxy.dirty = false;
          }

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

  public async convertToMarkdown(content: string, contentType: string,
    parameters: any): Promise<string> {
    return (await this.sendMessageToWorker('convertToMarkdown', {
      content: content,
      contentType: contentType,
      parameters: parameters
    }, true)).data;
  }

  public async getUrlContent(url: string): Promise<any> {
    return (await this.sendMessageToWorker('getUrlContent', { url: url },
      true)).data;
  }

  public getImportPreview(file: File, parameters: any): Promise<string> {
    return new Promise<string>((resolve: (preview: string) => void, reject:
      () => void) => {
      let fileReader: FileReader = new FileReader();
      fileReader.onload = async () => {
        resolve(await this.convertToMarkdown(fileReader.result, file.type,
          parameters));
      };

      fileReader.readAsArrayBuffer(file);
    });
  }

  public async importMarkdown(fileName: string, markdown: string, parentId:
    string): Promise<void> {
    return await this.sendMessageToWorker('importMarkdown',
      { fileName: fileName, markdown: markdown, parentId: parentId }, true);
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

  public getMarkdownRepresentation(koheseObject: any, enclosingType: any,
    dataModel: any, viewModel: any, formatDefinitionType: FormatDefinitionType,
    headingLevel: number, addLinks: boolean): string {
    let representation: string = '';
    let formatDefinition: FormatDefinition;
	  let formatDefinitionId: string = viewModel.defaultFormatKey[
	    formatDefinitionType];
	  if (formatDefinitionId) {
	    formatDefinition = viewModel.formatDefinitions[formatDefinitionId];
	  } else {
	    let treeConfiguration: TreeConfiguration = this.getTreeConfig().
	      getValue().config;
	    let dataModelItemProxy: ItemProxy = treeConfiguration.getProxyFor(
	      dataModel.id);
	    while (dataModelItemProxy) {
	      let ancestorViewModel: any = treeConfiguration.getProxyFor(
	        'view-' + dataModelItemProxy.item.name.toLowerCase()).item;
	      formatDefinitionId = ancestorViewModel.defaultFormatKey[
	        formatDefinitionType];
	      if (formatDefinitionId) {
	        formatDefinition = ancestorViewModel.formatDefinitions[
	          formatDefinitionId];
	        break;
	      }

	      dataModelItemProxy = treeConfiguration.getProxyFor(
	        dataModelItemProxy.item.base);
	    }

	    if (!formatDefinition) {
	      formatDefinition = viewModel.formatDefinitions[viewModel.
	        defaultFormatKey[FormatDefinitionType.DEFAULT]];
	    }
	  }

    let globalTypeNames: Array<string> = [];
    TreeConfiguration.getWorkingTree().getRootProxy().visitTree(
      { includeOrigin: false }, (itemProxy: ItemProxy) => {
      if (itemProxy.kind === 'KoheseModel') {
        globalTypeNames.push(itemProxy.item.name);
      }
    }, undefined);

    if (headingLevel > -1) {
      if ((headingLevel === 0) && (formatDefinitionType === FormatDefinitionType.DOCUMENT)) {
        representation += '<div style="font-size: xxx-large;">';
      } else {
        for (let j: number = 0; j < headingLevel; j++) {
	        representation += '#';
	      }

	      representation += ' ';
	    }
	  }

	  if (formatDefinition.header.contents.length > 0) {
  	  if (addLinks) {
	      representation += ('[' + koheseObject[formatDefinition.header.contents[
	        0].propertyName] + '](' + window.location.origin + LocationMap[
	        'Explore'].route + ';id=' + koheseObject.id + ')\n\n');
  	  } else {
	      representation += (koheseObject[formatDefinition.header.contents[0].
	        propertyName] + '\n\n');
	    }
	  }

	  if ((headingLevel === 0) && (formatDefinitionType === FormatDefinitionType.DOCUMENT)) {
	    representation += '</div>\n\n';
	  }

    for (let j: number = 0; j < formatDefinition.containers.length; j++) {
      let formatContainer: FormatContainer = formatDefinition.containers[j];
      if (formatContainer.kind === FormatContainerKind.
        REVERSE_REFERENCE_TABLE) {
        representation += '### Reverse References For ' + formatContainer.
          contents.map((propertyDefinition: PropertyDefinition) => {
          return '* ' + propertyDefinition.propertyName.kind + '\'s ' +
            propertyDefinition.propertyName.attribute;
        }).join('\n');

        representation += '\n\n<table><tr><th>' +
          'Name</th></tr>';

        let reverseReferencesObject: any = TreeConfiguration.getWorkingTree().
          getProxyFor(koheseObject.id).relations.referencedBy;
        for (let j: number = 0; j < formatContainer.contents.length; j++) {
          let propertyDefinition: PropertyDefinition = formatContainer.
            contents[j];
          if (reverseReferencesObject[propertyDefinition.propertyName.kind]) {
            let reverseReferences: Array<any> = reverseReferencesObject[
              propertyDefinition.propertyName.kind][propertyDefinition.
              propertyName.attribute].map((itemProxy: ItemProxy) => {
              return itemProxy.item;
            });
            for (let k: number = 0; k < reverseReferences.length; k++) {
              representation += ('<tr style="vertical-align: top;"><td>' +
                reverseReferences[k].name + '</td></tr>');
            }
          }
        }

        representation += '</table>\n\n';
      } else {
        let header: string;
        let body: string;
        let isVerticalFormatContainer: boolean = (formatContainer.kind ===
          FormatContainerKind.VERTICAL);
        if (!isVerticalFormatContainer) {
          representation += '\n\n<table>';
          header = '<tr>';
          body = '<tr style="vertical-align: top;">';
        }

        for (let k: number = 0; k < formatContainer.contents.length; k++) {
          if (isVerticalFormatContainer) {
            header = '';
            body = '';
          }

          let propertyDefinition: PropertyDefinition = formatContainer.
            contents[k];
          if (propertyDefinition.visible) {
            if (propertyDefinition.labelOrientation === 'Top') {
              if (isVerticalFormatContainer) {
                header += ('**' + propertyDefinition.customLabel +
                  ':**\n\n');
              } else {
                header += ('<th>' + propertyDefinition.customLabel +
                  '</th>');
              }
            }

            if (!isVerticalFormatContainer) {
              body += '<td>';
            }

            if (propertyDefinition.labelOrientation === 'Left') {
              body += ('**' + propertyDefinition.customLabel + ':** ');
            }

            let value: any = koheseObject[propertyDefinition.propertyName];
            if (value != null) {
              if ((propertyDefinition.kind === '') || (propertyDefinition.kind
                === 'proxy-selector')) {
                if (propertyDefinition.tableDefinition) {
                  if (isVerticalFormatContainer) {
                    body += '\n\n<table><tr>';
                  } else {
                    body += '<table><tr>';
                  }

                  let attributeTypeDataModel: any;
                  let attributeTypeViewModel: any;
                  let tableDefinition: TableDefinition;
                  let typeName: string = dataModel.classProperties[
                    propertyDefinition.propertyName].definition.type[0];
                  let isLocalTypeAttribute: boolean = (globalTypeNames.indexOf(
                    typeName) === -1);
                  if (isLocalTypeAttribute) {
                    attributeTypeDataModel = (enclosingType ? enclosingType :
                      dataModel).classLocalTypes[typeName].definition;
                    attributeTypeViewModel = this.currentTreeConfigSubject.
                      getValue().config.getProxyFor('view-' + (enclosingType ?
                      enclosingType : dataModel).classLocalTypes[typeName].
                      definedInKind.toLowerCase()).item.localTypes[typeName];
                    tableDefinition = attributeTypeViewModel.tableDefinitions[
                      propertyDefinition.tableDefinition];
                  } else {
                    attributeTypeDataModel = this.currentTreeConfigSubject.
                      getValue().config.getProxyFor(typeName).item;
                    attributeTypeViewModel = this.currentTreeConfigSubject.
                      getValue().config.getProxyFor('view-' + typeName.
                      toLowerCase()).item;
                    tableDefinition = attributeTypeViewModel.tableDefinitions[
                      propertyDefinition.tableDefinition];
                  }

                  for (let l: number = 0; l < tableDefinition.columns.length;
                    l++) {
                    body += ('<th>' + tableDefinition.columns[l] + '</th>');
                  }

                  body += '</tr>';

                  for (let l: number = 0; l < value.length; l++) {
                    let reference: any;
                    if (isLocalTypeAttribute) {
                      reference = value[l];
                    } else {
                      reference = TreeConfiguration.getWorkingTree().
                        getProxyFor(value[l].id).item;
                    }

                    body += '<tr style="vertical-align: top;">';

                    for (let m: number = 0; m < tableDefinition.columns.length;
                      m++) {
                      body += '<td>';
                      if (reference[tableDefinition.columns[m]]) {
                        if (Array.isArray(attributeTypeDataModel.classProperties[
                          tableDefinition.columns[m]].definition.type)) {
                          body += '<ul>';
                          for (let n: number = 0; n < reference[
                            tableDefinition.columns[m]].length; n++) {
                            body += ('<li>' + this.getStringRepresentation(
                              reference, tableDefinition.columns[m], n,
                              (enclosingType ? enclosingType : dataModel),
                              attributeTypeDataModel, attributeTypeViewModel,
                              formatDefinitionType) + '</li>');
                          }

                          body += '</ul>';
                        } else {
                          body += this.getStringRepresentation(reference,
                            tableDefinition.columns[m], undefined,
                            (enclosingType ? enclosingType : dataModel),
                            attributeTypeDataModel, attributeTypeViewModel,
                            formatDefinitionType);
                        }
                      }

                      body += '</td>';
                    }

                    body += '</tr>';
                  }

                  body += '</table>';
                  if (isVerticalFormatContainer) {
                    body += '\n\n';
                  }
                } else {
                  let type: any = dataModel.classProperties[propertyDefinition.
                    propertyName].definition.type;
                  type = (Array.isArray(type) ? type[0] : type);
                  if ((propertyDefinition.propertyName !== 'parentId') &&
                    (globalTypeNames.indexOf(type) === -1)) {
                    /* The below condition is present to avoid errors caused by
                    attributes typed "object". */
                    let classLocalTypesEntry: any = (enclosingType ?
                      enclosingType : dataModel).classLocalTypes[type];
                    if (classLocalTypesEntry) {
                      // Local type attribute
                      let localTypeDataModel: any = classLocalTypesEntry.
                        definition;
                      let localTypeViewModel: any = this.
                        currentTreeConfigSubject.getValue().config.getProxyFor(
                        'view-' + classLocalTypesEntry.definedInKind.
                        toLowerCase()).item.localTypes[type];
                      switch (localTypeDataModel.metatype) {
                        case Metatype.STRUCTURE:
                          if (Array.isArray(value)) {
                            body += value.map((v: any) => {
                              return this.getMarkdownRepresentation(v,
                                (enclosingType ? enclosingType : dataModel),
                                localTypeDataModel, localTypeViewModel,
                                formatDefinitionType, -1, addLinks);
                            }).join('\n');
                          } else {
                            body += this.getMarkdownRepresentation(value,
                              (enclosingType ? enclosingType : dataModel),
                              localTypeDataModel, localTypeViewModel,
                              formatDefinitionType, -1, addLinks);
                          }

                          break;
                        case Metatype.ENUMERATION:
                          if (Array.isArray(value)) {
                            body += value.map((v: any, index: number) => {
                              return localTypeViewModel.values[
                                localTypeDataModel.values.map((enumerationValue:
                                EnumerationValue) => {
                                return enumerationValue.name;
                              }).indexOf(v)];
                            }).join('\n\n');
                          } else {
                            body += localTypeViewModel.values[
                              localTypeDataModel.values.map((enumerationValue:
                              EnumerationValue) => {
                              return enumerationValue.name;
                            }).indexOf(value)];
                          }

                          break;
                        case Metatype.VARIANT:
                          if (Array.isArray(value)) {
                            body += value.map((v: any, index: number) => {
                              return this.getStringRepresentation(koheseObject,
                                propertyDefinition.propertyName, index,
                                enclosingType, dataModel, viewModel,
                                formatDefinitionType);
                            }).join('\n\n');
                          } else {
                            body += this.getStringRepresentation(koheseObject,
                              propertyDefinition.propertyName, undefined,
                              enclosingType, dataModel, viewModel,
                              formatDefinitionType);
                          }

                          break;
                      }
                    }
                  } else {
                    // Global type attribute
                    if (Array.isArray(value)) {
                      let stringComponents: Array<string> = [];
                      for (let l: number = 0; l < value.length; l++) {
                        let arrayComponent: any = value[l];
                        let id: string;
                        if (arrayComponent.id != null) {
                          id = arrayComponent.id;
                        } else {
                          // Accommodation code
                          id = arrayComponent;
                        }

                        stringComponents.push('* ' + TreeConfiguration.
                          getWorkingTree().getProxyFor(id).item.name);
                      }

                      body += stringComponents.join('\n');
                    } else {
                      let id: string;
                      if (value.id != null) {
                        id = value.id;
                      } else {
                        // Accommodation code
                        id = value;
                      }

                      body += TreeConfiguration.getWorkingTree().
                        getProxyFor(id).item.name;
                    }
                  }
                }
              } else if (Array.isArray(value)) {
                body += value.map((v: any, index: number) => {
                  return ('* ' + this.getStringRepresentation(koheseObject,
                    propertyDefinition.propertyName, index, enclosingType,
                    dataModel, viewModel, formatDefinitionType));
                }).join('\n');
              } else {
                body += this.getStringRepresentation(koheseObject,
                  propertyDefinition.propertyName, undefined, enclosingType,
                  dataModel, viewModel, formatDefinitionType);
              }
            }

            body += '\n\n'
            if (isVerticalFormatContainer) {
              representation += (header + body);
            } else {
              body += '</td>';
            }
          }
        }

        if (!isVerticalFormatContainer) {
          representation += (header + '</tr>' + body + '</tr>' +
            '\n</table>\n\n');
        }
      }
    }

    return representation;
  }

  public getStringRepresentation(koheseObject: any, attributeName: string,
    index: number, enclosingType: KoheseDataModel, dataModel: KoheseDataModel,
    viewModel: KoheseViewModel, formatDefinitionType: FormatDefinitionType):
    string {
    let value: any;
    if (index != null) {
      value = koheseObject[(dataModel.metatype === Metatype.VARIANT) ? 'value'
        : attributeName][index];
    } else {
      value = koheseObject[(dataModel.metatype === Metatype.VARIANT) ? 'value'
        : attributeName];
    }

    if ((attributeName === 'parentId') && (dataModel['classProperties'][
      attributeName].definedInKind === 'Item') && ((typeof value) ===
      'string')) {
      return this.currentTreeConfigSubject.getValue().config.getProxyFor(
        value).item.name;
    }

    let type: any = dataModel['classProperties'][attributeName].definition.
      type;
    type = (Array.isArray(type) ? type[0] : type);

    if (type === 'timestamp') {
      return new Date(value).toLocaleDateString();
    }

    let classLocalTypes: any = (enclosingType ? enclosingType : dataModel)[
      'classLocalTypes'];
    if (classLocalTypes && classLocalTypes[type]) {
      switch (classLocalTypes[type].definition.metatype) {
        case Metatype.ENUMERATION:
          return this.currentTreeConfigSubject.getValue().config.getProxyFor(
            'view-' + classLocalTypes[type].definedInKind.toLowerCase()).item.
            localTypes[type].values[classLocalTypes[type].definition.values.
            map((enumerationValue: EnumerationValue) => {
            return enumerationValue.name;
          }).indexOf(value)];
      }
    }

    let representation: string = String(value);
    if (representation === String({})) {
      if (classLocalTypes && classLocalTypes[type]) {
        if (value.name) {
          return value.name;
        } else if (value.id) {
          return value.id;
        } else {
          viewModel = this.currentTreeConfigSubject.getValue().config.
            getProxyFor('view-' + classLocalTypes[type].definedInKind.
            toLowerCase()).item.localTypes[type];
          let formatDefinitionId: string = viewModel.defaultFormatKey[
            formatDefinitionType];
          if (!formatDefinitionId) {
            formatDefinitionId = viewModel.defaultFormatKey[
              FormatDefinitionType.DEFAULT];
          }
          let formatDefinition: FormatDefinition = viewModel.formatDefinitions[
            formatDefinitionId];
          for (let j: number = 0; j < formatDefinition.containers.length;
            j++) {
            if ((formatDefinition.containers.length > 0) && (formatDefinition.
              containers[0].kind !== FormatContainerKind.
              REVERSE_REFERENCE_TABLE) && (formatDefinition.containers[0].
              contents.length > 0)) {
              if (classLocalTypes[type].definition.metatype === Metatype.
                VARIANT) {
                formatDefinitionId = viewModel.defaultFormatKey[
                  formatDefinitionType];
                if (formatDefinitionId == null) {
                  formatDefinitionId = viewModel.defaultFormatKey[
                    FormatDefinitionType.DEFAULT];
                }
                formatDefinition = viewModel.formatDefinitions[
                  formatDefinitionId];
                for (let k: number = 0; k < formatDefinition.containers.length;
                  k++) {
                  let formatContainer: FormatContainer = formatDefinition.
                    containers[k];
                  if (formatContainer.kind !== FormatContainerKind.
                    REVERSE_REFERENCE_TABLE) {
                    for (let l: number = 0; l < formatContainer.contents.
                      length; l++) {
                      if (value.discriminant === formatContainer.contents[l].
                        propertyName) {
                        if (Array.isArray(value.value)) {
                          return (formatContainer.contents[l].customLabel +
                            ':\n\n' + value.value.map((element: any, valueIndex:
                            number) => {
                            return this.getStringRepresentation(value, value.
                              discriminant, valueIndex, (enclosingType ?
                              enclosingType : dataModel), classLocalTypes[
                              type].definition, viewModel,
                              formatDefinitionType);
                          }).join('\n\n'));
                        } else {
                          return (formatContainer.contents[l].customLabel +
                            ': ' + this.getStringRepresentation(value, value.
                            discriminant, undefined, (enclosingType ?
                            enclosingType : dataModel), classLocalTypes[
                            type].definition, viewModel,
                            formatDefinitionType));
                        }
                      }
                    }
                  }
                }
              } else {
                let propertyDefinition: PropertyDefinition = formatDefinition.
                  containers[0].contents[0];
                return propertyDefinition.customLabel + ': ' + this.
                  getStringRepresentation(value, propertyDefinition.
                  propertyName, undefined, (enclosingType ? enclosingType :
                  dataModel), classLocalTypes[type].definition, viewModel,
                  formatDefinitionType);
              }
            }
          }

          let firstAttributeName: string = Object.keys(value)[0];
          return firstAttributeName + ': ' + this.getStringRepresentation(
            value, firstAttributeName, undefined, (enclosingType ?
            enclosingType : dataModel), classLocalTypes[type].definition,
            viewModel, formatDefinitionType);
        }
      } else {
        return this.currentTreeConfigSubject.getValue().config.getProxyFor(
          value.id).item.name;
      }
    } else {
      return representation;
    }
  }

  //////////////////////////////////////////////////////////////////////////
  public async getHistoryFor(proxy: ItemProxy): Promise<any> {

    proxy.history = await this._cache.getHistory(proxy.item.id);
    proxy.newHistoryNewStyle = await this._cache.getHistoryWithNewStyle(proxy.item.id);
    // TODO: Determine why subscribers are changing the returned history

    /* Return a copy of the history so that subscribers may modify the
    returned history, if desired. */
    return JSON.parse(JSON.stringify(proxy.history));
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
  public getTreeConfig(): BehaviorSubject<TreeConfigInfo> {
    return this.currentTreeConfigSubject;
  }

  //////////////////////////////////////////////////////////////////////////
  async setTreeConfig(commitId: string, configType: TreeConfigType): Promise<void> {
    let treeConfiguration = TreeConfiguration.getTreeConfigFor(commitId);
    if (!treeConfiguration) {
      treeConfiguration = new TreeConfiguration(commitId);
      let itemCache : ItemCache = ItemCache.getItemCache();
      await itemCache.loadProxiesForCommit(commitId, treeConfiguration);
      treeConfiguration.loadingComplete();
    }

    this.currentTreeConfigSubject.next({
      config: treeConfiguration,
      configType: configType
    });
  }
}
