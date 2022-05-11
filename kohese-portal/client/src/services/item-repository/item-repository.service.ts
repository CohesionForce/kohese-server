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


// Angular
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Other External Dependencies
import * as _ from 'underscore';
import { ToastrService } from 'ngx-toastr';
import { MarkdownService } from 'ngx-markdown';

// Kohese
import { CurrentUserService } from '../user/current-user.service';
import { DialogService } from '../dialog/dialog.service';
import { VersionControlService } from '../version-control/version-control.service';

import { FormatDefinition, FormatDefinitionType } from '../../../../common/src/FormatDefinition.interface';
import { FormatContainer, FormatContainerKind } from '../../../../common/src/FormatContainer.interface';
import { PropertyDefinition } from '../../../../common/src/PropertyDefinition.interface';
import { TableDefinition } from '../../../../common/src/TableDefinition.interface';
import { LocationMap } from '../../constants/LocationMap.data';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { TreeHashMap } from '../../../../common/src/tree-hash';
import { ItemCache } from '../../../../common/src/item-cache';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { KoheseModel } from '../../../../common/src/KoheseModel';
import { KoheseView } from '../../../../common/src/KoheseView';

import { LogService } from '../log/log.service';
import { InitializeLogs } from './item-repository.registry';
import { Metatype } from '../../../../common/src/Type.interface';
import { EnumerationValue } from '../../../../common/src/Enumeration.interface';
import { KoheseDataModel, KoheseViewModel } from '../../../../common/src/KoheseModel.interface';
import { CacheManager } from '../../../../client/cache-worker/CacheManager';
import { AuthenticationService } from '../authentication/authentication.service';

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

  shortProxyList: Array<ItemProxy>;
  modelTypes: Object;
  private _repoState: RepoStates = undefined;

  logEvents: any;


  state: any;

  repositoryStatus: BehaviorSubject<any>;
  repoSyncStatus = {};

  currentTreeConfigSubject: BehaviorSubject<TreeConfigInfo> = new BehaviorSubject<TreeConfigInfo>(undefined);

  saveAndContinueSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  currentSaveAndContinueValue = this.saveAndContinueSubject.asObservable();

  private _cache: ItemCache = new ItemCache();
  private _initialized: boolean = false;
  private _initialWorkingTreeNotificationSent = false;


  //////////////////////////////////////////////////////////////////////////
  constructor(
              private CacheManager : CacheManager,
              private CurrentUserService: CurrentUserService,
              private AuthenticationService: AuthenticationService,
              private toastrService: ToastrService,
              private dialogService: DialogService,
              private _versionControlService: VersionControlService,
              private logService: LogService,
              private _markdownService: MarkdownService
  ) {
    this.logEvents = InitializeLogs(logService)
    this.logService.log(this.logEvents.itemRepoInit);


    this._repoState = RepoStates.DISCONNECTED;
    this.repositoryStatus = new BehaviorSubject({
      state: this._repoState,
      message: 'Initializing Item Repository'
    });

    // Establish the Item Cache
    ItemCache.setItemCache(this._cache);

    // Subscribe to messages from

    CacheManager.subscribe('reconnected', (messageData) => {
      this.sync();
    });

    CacheManager.subscribe('connectionError', (messageData) => {
      // TODO: Should only send the state changes once
      this.updateRepositorySyncState(
        RepoStates.DISCONNECTED,
        'Disconnected'
      );
    });

    CacheManager.subscribe('userLockedOut', (messageData) => {
      this.updateRepositorySyncState(
        RepoStates.USER_LOCKED_OUT,
        'User is locked out'
      );
    });

    CacheManager.subscribe('verifyConnection', (messageData) => {
      CacheManager.sendMessageToWorker('connectionVerification', undefined, false);
    });

    CacheManager.subscribe('update', (messageData) => {
      this.buildOrUpdateProxy(messageData.item, messageData.kind, messageData.status);
    });

    CacheManager.subscribe('updateItemStatus', (messageData) => {
      this.updateItemStatus(messageData.itemId, messageData.status);
    });

    CacheManager.subscribe('deletion', (messageData) => {
      TreeConfiguration.getWorkingTree().getProxyFor(messageData.id).deleteItem();
    });

    CacheManager.subscribe('cachePiece', (messageData) => {
      const cachePiece: any = messageData;
      this.processCachePiece(cachePiece);
    });

    // Try to notify cacheWorker if the tab is closing
    addEventListener( 'unload', () => {
      CacheManager.sendMessageToWorker('tabIsClosing', undefined, false)
    });

    this.CurrentUserService.getCurrentUserSubject()
      .subscribe((decodedToken) => {
      this.logService.log(this.logEvents.itemRepositoryAuthenticated);
      if (decodedToken) {
        this.logService.log(this.logEvents.socketAlreadyConnected);
        this.updateRepositorySyncState(
          RepoStates.SYNCHRONIZING,
          'Starting Repository Sync'
        );
        CacheManager.sendMessageToWorker('connect', AuthenticationService.getToken().getValue(),
          true).then(async () => {
          this.sync();
        });
      } else {
        // TODO: Need to disconnect cache-worker
        console.log('*** Need to disconnect cache-worker');
      }
    });
  }

  //////////////////////////////////////////////////////////////////////////
  saveAndContinueEditing(continueEditing: boolean) {
    this.saveAndContinueSubject.next(continueEditing);
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
    return (await this.CacheManager.sendMessageToWorker('getSessionMap', undefined, true));
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
        const fundamentalItemsResponse = await this.CacheManager.sendMessageToWorker(
          'getFundamentalItems', { refresh: false }, true);
        this.processBulkUpdate(fundamentalItemsResponse);
        KoheseModel.modelDefinitionLoadingComplete();
        this.updateRepositorySyncState(RepoStates.KOHESEMODELS_SYNCHRONIZED,
          'KoheseModels are available for use');

        let afterSyncMetaModels = Date.now();
        console.log('^^^ Time to getMetaModels: ' + (afterSyncMetaModels - beforeSync) / 1000);

        await this.CacheManager.sendMessageToWorker('getCache', { refresh: false }, true);

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
      const itemUpdatesResponse = await this.CacheManager.sendMessageToWorker(
        'getItemUpdates', { refresh: false, treeHashes: treeHashes }, true);
      this.processBulkUpdate(itemUpdatesResponse);

      let afterGetAll = Date.now();
      console.log('^^^ Time to get and load deltas: ' + (afterGetAll - afterCalcTreeHashes) / 1000);

      // Ensure status for all items is updated
      console.log('^^^ Getting status');
      const statusResponse = await this.CacheManager.sendMessageToWorker(
        'getStatus', undefined, true);
        let currentVCStatus = workingTree.getVCStatus();
        let vcDiff = TreeConfiguration.compareVCStatus(currentVCStatus, statusResponse.idStatusArray);
        console.log('::: Processing status response');
        for (let key in vcDiff) {
           let newStatus = vcDiff[key].to || [];
           this.updateItemStatus(key, newStatus)
        }
      console.log('^^^ Received status update with count of: ' + statusResponse.statusCount);

      let afterGetStatus = Date.now();
      console.log('^^^ Time to get status: ' + (afterGetStatus - afterGetAll) / 1000);

      // TODO: Need to determine if second update is required

      let secondItemUpdateResponse = await this.CacheManager.sendMessageToWorker(
        'getItemUpdates', { refresh: true, treeHashes: workingTree.getAllTreeHashes() }, true);

      let afterLoading = Date.now();
      console.log('^^^ Time to perform second sync: ' + (afterLoading - afterGetStatus) / 1000);
      console.log('^^^ Total time to sync: ' + (afterLoading - beforeSync) / 1000);

      let syncIsComplete = secondItemUpdateResponse.kdbMatches;

      if (syncIsComplete){
        this.logService.log(this.logEvents.kdbSynced);
      } else {
        // Process the updates
        this.processBulkUpdate(secondItemUpdateResponse);

        this.logService.log(this.logEvents.compareHashAfterUpdate);

        let updatedTreeHashes = workingTree.getAllTreeHashes();

        let diffRTH = TreeHashMap.diff(updatedTreeHashes, secondItemUpdateResponse.repoTreeHashes);

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
        } else if (kind === 'KoheseView') {
          proxy = new KoheseView(item);
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
        } else if (kind === 'KoheseView') {
          new KoheseView(item, TreeConfiguration.getWorkingTree());
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
    }

    if (response.addItems) {
      response.addItems.forEach((addedItem) => {
        let iProxy;
        if (addedItem.kind === 'KoheseModel') {
          iProxy = new KoheseModel(addedItem.item);
        } else if (addedItem.kind === 'KoheseView') {
          new KoheseView(addedItem.item);
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
        } else if (changededItem.kind === 'KoheseView') {
          new KoheseView(changededItem.item);
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



  public async getIcons(): Promise<Array<string>> {
    return (await this.CacheManager.sendMessageToWorker('getIcons', {}, true));
  }

  public async fetchItem(proxy): Promise<void> {
    let fetchResponse = (await this.CacheManager.sendMessageToWorker('fetchItem', {id: proxy.item.id}, true));
    proxy.updateItem(fetchResponse.kind, fetchResponse.item);
  }

  //////////////////////////////////////////////////////////////////////////
  public async upsertItem(kind: string, item: any): Promise<ItemProxy> {
    // Clone item to strip itemChangeHandler which is causing circular references
    let clonedItem = JSON.parse(JSON.stringify(item));
    let upsertItemResponse = (await this.CacheManager.sendMessageToWorker('upsertItem', {kind: kind, item: clonedItem}, true));

    return new Promise<ItemProxy>((resolve: ((value: ItemProxy) => void), reject: ((value: any) => void)) => {
      if (upsertItemResponse.error) {
        let tmpstring: any = JSON.parse(JSON.stringify(upsertItemResponse.error));
        if (JSON.stringify(tmpstring.validation.missingProperties)) {
          this.dialogService.openInformationDialog('Error', 'An error occurred while saving '
            + clonedItem.name + '. ' + 'Missing Properties ' + JSON.stringify(tmpstring.validation.missingProperties));
        } else {
          this.dialogService.openInformationDialog('Error', 'An error occurred while saving '
            + clonedItem.name + '. ' + 'Validation Errors Exist ' + JSON.stringify(tmpstring.validation.invalidData));
        }
        reject(upsertItemResponse.error);
      } else {
        let proxy: ItemProxy;
        if (!clonedItem.id) {
          if (kind === 'KoheseModel') {
            proxy = new KoheseModel(upsertItemResponse.item);
          } else if (kind === 'KoheseView') {
            proxy = new KoheseView(clonedItem, TreeConfiguration.getWorkingTree());
          } else {
            proxy = new ItemProxy(upsertItemResponse.kind, upsertItemResponse.item);
          }
        } else {
          proxy = TreeConfiguration.getWorkingTree().getProxyFor(clonedItem.id);
          proxy.updateItem(upsertItemResponse.kind, upsertItemResponse.item);
          proxy.dirty = false;
        }

        resolve(proxy);
      }
    });
  }
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async deleteItem(proxy, recursive): Promise<void> {
    this.logService.log(this.logEvents.deletingItem, {item : proxy, recursive : recursive});

    let deletedItemResponse = await this.CacheManager.sendMessageToWorker('deleteItem', {
      kind: proxy.kind,
      id: proxy.item.id,
      recursive: recursive
    }, true);

    if (deletedItemResponse.error) {
      this.dialogService.openInformationDialog('Error', 'An error occurred while deleting ' + proxy.item.name + '.');
    }
  }

  public async convertToMarkdown(content: string, contentType: string,
    parameters: any): Promise<string> {
    return (await this.CacheManager.sendMessageToWorker('convertToMarkdown', {
      content: content,
      contentType: contentType,
      parameters: parameters
    }, true));
  }

  public async getUrlContent(url: string): Promise<any> {
    return (await this.CacheManager.sendMessageToWorker('getUrlContent', { url: url },
      true));
  }

  public getImportPreview(file: File, parameters: any): Promise<string> {
    return new Promise<string>((resolve: (preview: string) => void, reject:
      () => void) => {
      let fileReader: FileReader = new FileReader();
      fileReader.onload = async () => {
        resolve(await this.convertToMarkdown((fileReader.result as string), file.type,
          parameters));
      };

      fileReader.readAsArrayBuffer(file);
    });
  }

  public async importMarkdown(fileName: string, markdown: string, parentId:
    string): Promise<void> {
    return await this.CacheManager.sendMessageToWorker('importMarkdown',
      { fileName: fileName, markdown: markdown, parentId: parentId }, true);
  }

  public async produceReport(report: string, reportName: string, format:
    string): Promise<void> {
    return await this.CacheManager.sendMessageToWorker('produceReport', {
      reportName: reportName,
      format: format,
      content: report
    }, true);
  }

  public async getReportMetaData(): Promise<Array<any>> {
    return (await this.CacheManager.sendMessageToWorker('getReportMetaData', {}, true));
  }

  public async renameReport(oldReportName: string, newReportName: string):
    Promise<void> {
    return await this.CacheManager.sendMessageToWorker('renameReport',
      { oldReportName: oldReportName, newReportName: newReportName }, true);
  }

  public async getReportPreview(reportName: string): Promise<string> {
    return (await this.CacheManager.sendMessageToWorker('getReportPreview',
      { reportName: reportName }, true));
  }

  public async removeReport(reportName: string): Promise<void> {
    return await this.CacheManager.sendMessageToWorker('removeReport',
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
	    let treeConfiguration: TreeConfiguration = this.currentTreeConfigSubject.
	      getValue().config;
	    let dataModelItemProxy: ItemProxy = treeConfiguration.getProxyFor(
	      dataModel.id);
	    while (dataModelItemProxy) {
        let ancestorViewModel: any = (dataModelItemProxy as KoheseModel).view.
          item;
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
    // TODO: Need to replace working tree with a better solution for obtaining KoheseModels
    // TODO: When we begin versioning the KoheseModels the following will no longer be required
    TreeConfiguration.getWorkingTree().getRootProxy().visitTree(
      { includeOrigin: false }, (itemProxy: ItemProxy) => {
      if (itemProxy.kind === 'KoheseModel') {
        globalTypeNames.push(itemProxy.item.name);
      }
    }, undefined);

    if (headingLevel > -1) {
      if ((headingLevel === 0) && (formatDefinitionType === FormatDefinitionType.DOCUMENT)) {
        representation += '<div style="font-size: x-large;">';
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
        if(formatDefinitionType === FormatDefinitionType.DOCUMENT) {
          representation += (koheseObject[formatDefinition.header.contents[0].propertyName] + '\n\n');
        }
	    }
	  }

	  if ((headingLevel === 0) && (formatDefinitionType === FormatDefinitionType.DOCUMENT)) {
	    representation += '</div>\n\n';
	  }

    for (let j: number = 0; j < formatDefinition.containers.length; j++) {
      let formatContainer: FormatContainer = formatDefinition.containers[j];
      if (formatContainer.kind === FormatContainerKind.
        REVERSE_REFERENCE_TABLE) {

        let references: string = '';
        let reverseReferencesObject: any = this.currentTreeConfigSubject.
          getValue().config.getProxyFor(koheseObject.id).relations.
          referencedBy;
        for (let j: number = 0; j < formatContainer.contents.length; j++) {
          let propertyDefinition: PropertyDefinition = formatContainer.
            contents[j];
          if (reverseReferencesObject[propertyDefinition.propertyName.kind]) {
            references = '#### Referenced as ' + propertyDefinition.customLabel + '\n\n';
            let reverseReferences: Array<any> = reverseReferencesObject[
              propertyDefinition.propertyName.kind][propertyDefinition.propertyName.attribute];

            let reverseReferencesItems: Array<any>;
            if (reverseReferences) {
              reverseReferencesItems = reverseReferences.map((itemProxy: ItemProxy) => {
                return itemProxy.item;
              });
            }

            if (reverseReferencesItems) {
              representation += references;
              for (let k: number = 0; k < reverseReferencesItems.length; k++) {
                representation += '**Name:** ' + reverseReferencesItems[k].name;
                representation += '\n\n';
                if (reverseReferencesItems[k].kind === 'Issue') {
                  representation += '**Issue State:** ' + reverseReferencesItems[k].issueState;
                }
                representation += '\n\n';
              }
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
                      getValue().config.getProxyFor((enclosingType ?
                      enclosingType : dataModel).classLocalTypes[typeName].
                      definedInKind).view.item.localTypes[typeName];
                    tableDefinition = attributeTypeViewModel.tableDefinitions[
                      propertyDefinition.tableDefinition];
                  } else {
                    attributeTypeDataModel = this.currentTreeConfigSubject.
                      getValue().config.getProxyFor(typeName).item;
                    attributeTypeViewModel = this.currentTreeConfigSubject.
                      getValue().config.getProxyFor(typeName).view.item;
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
                      reference = this.currentTreeConfigSubject.getValue().
                        config.getProxyFor(value[l].id).item;
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
                        classLocalTypesEntry.definedInKind).view.item.
                        localTypes[type];
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

                        stringComponents.push('* ' + this.
                          currentTreeConfigSubject.getValue().config.
                          getProxyFor(id).item.name);
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

                      body += this.currentTreeConfigSubject.getValue().config.
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
      if (value == null) {
        return String(value);
      } else {
        return new Date(value).toLocaleDateString();
      }
    }

    let classLocalTypes: any = (enclosingType ? enclosingType : dataModel)[
      'classLocalTypes'];
    if (classLocalTypes && classLocalTypes[type]) {
      switch (classLocalTypes[type].definition.metatype) {
        case Metatype.ENUMERATION:
          return this.currentTreeConfigSubject.getValue().config.getProxyFor(
            classLocalTypes[type].definedInKind).view.item.localTypes[type].
            values[classLocalTypes[type].definition.values.map(
            (enumerationValue: EnumerationValue) => {
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
            getProxyFor(classLocalTypes[type].definedInKind).view.item.
            localTypes[type];
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
  public async performAnalysis(forProxy): Promise<any> {
    let analysisResponse =
      (await this.CacheManager.sendMessageToWorker('performAnalysis', {kind: forProxy.kind, id: forProxy.item.id}, true));
    return analysisResponse;
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
