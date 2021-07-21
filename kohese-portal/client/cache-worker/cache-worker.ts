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


console.log('$$$ Loading Cache Worker');

import {io , Socket} from 'socket.io-client';
import * as LevelJs from 'level-js';
import * as _ from 'underscore';

import { ItemProxy } from '../../common/src/item-proxy';
import { TreeHashMap } from '../../common/src/tree-hash';
import { TreeConfiguration } from '../../common/src/tree-configuration';
import { KoheseModel } from '../../common/src/KoheseModel';
import { KoheseView } from '../../common/src/KoheseView';
import { LevelCache } from '../../common/src/level-cache';
import { Workspace } from '../../common/src/kohese-commit';

let socket: Socket;
let clientMap = {};
let _authRequest = {};
let kioListenersInitialized: boolean = false;

let cacheInitialized: boolean = false;
let _cache: LevelCache;
let _connectionAuthenticatedPromise: Promise<any>;
let _userLockedOut : boolean = false;
let _fundamentalItemsPromise: Promise<any>;
let _loadedCachePromise: Promise<any>;
let _itemUpdatesPromise: Promise<any>;

let _suppressWorkerRequestAnnouncement = {
  verifyConnection: true
};

let _suppressWorkerEventAnnouncement = {
  connectionVerification: true
};


let _lastClientId :number = 0;

let _workingTree = TreeConfiguration.getWorkingTree();

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
(<any>self).onerror = (error) => {
  console.log('*** Received error in cache worker');
  console.log(error);
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
(<any>self).onconnect = (connectEvent: any) => {
  var port = connectEvent.ports[0];

  console.log('::: Received new connection');
  console.log(connectEvent);

  if (!cacheInitialized) {
    _cache = new LevelCache(LevelJs('item-cache'));
    LevelCache.setItemCache(_cache);
    cacheInitialized = true;
  }

  const clientId = ++_lastClientId;
  port.koheseClientTabId = clientId;
  port.koheseAssumedTabClosedUnexpectedly = false;

  clientMap[clientId] = port;
  let lastTabResponseTime = Date.now();

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  port.onmessage = async (event: any) => {
    const request = event.data;

    const requestStartTime = Date.now();
    if (!_suppressWorkerEventAnnouncement[request.type])
    {
      console.log('^^^ Received request ' + request.type + ' from tab ' + clientId);
    }

    // Determine which message handler to invoke
    switch (request.type) {
      case 'connect':
        if (!socket) {
          socket = io({
            rejectUnauthorized: false
          });
          socket.on('connect_error', (err) => {
            console.log('*** Worker socket connection error');
            console.log(JSON.stringify(err, null, '  '));
            postToAllPorts('connectionError', {});
          });
          socket.on('reconnect', async () => {
            console.log('^^^ Socket reconnected');
            _connectionAuthenticatedPromise = authenticate(_authRequest);
            await _connectionAuthenticatedPromise;
            for (let key in clientMap) {
              // Provide notification of client tab ids to server
              if (!port.koheseAssumedTabClosedUnexpectedly) {
                socket.emit('connectionAdded', {
                  id: socket.id,
                  clientTabId: clientMap[key].koheseClientTabId
                });
              } else {
                console.log('!!! Client list has a tab that is assumed closed: ' + port.koheseClientTabId);
              }
            }

            postToAllPorts('reconnected', {});
          });
          socket.connect();

          _authRequest = request.data;
          _connectionAuthenticatedPromise = authenticate(_authRequest);
        }

        if (_userLockedOut) {
          port.postMessage({message:'userLockedOut'});
        }

        await _connectionAuthenticatedPromise;
        tabConnected(clientId, port);
        port.postMessage({ id: request.id });
        break;

      case 'Admin/lockoutUser':
        console.log('::: Locking out user: ' + request.data.username);
        socket.emit(request.type, request.data, (response) => {
          port.postMessage({ id: request.id, data: response});
        });
        break;

      case 'Admin/reinstateUser':
        console.log('::: Reinstating user: ' + request.data.username);
        socket.emit(request.type, request.data, (response) => {
          port.postMessage({ id: request.id, data: response});
        });
        break;

      case 'Admin/getUserLockoutList':
        console.log('::: Sending user lockout list: ' + request.data.username);
        socket.emit(request.type, request.data, (response) => {
          port.postMessage({ id: request.id, data: response});
        });
        break;

      case 'tabIsClosing':
        console.log('::: Client tab is closing: ' + clientId);
        tabDisconnected(clientId);
        break;

      case 'getFundamentalItems':
        if (!_fundamentalItemsPromise || request.data.refresh) {
          _fundamentalItemsPromise = synchronizeModels();
        }

        const fundamentalItems = await _fundamentalItemsPromise;

        port.postMessage({
          id: request.id,
          data: fundamentalItems
        });
        break;

      case 'getCache':
        if (!_loadedCachePromise || request.data.refresh) {
          _loadedCachePromise = populateCache();
        }

        await _loadedCachePromise;
        let objectMap = _cache.getObjectMap();

        port.postMessage({ message: 'cachePiece', data: {
          key: 'metadata',
          value: objectMap.metadata
        } });
        port.postMessage({ message: 'cachePiece', data: {
          key: 'ref',
          value: objectMap.refMap
        } });
        port.postMessage({ message: 'cachePiece', data: {
          key: 'tag',
          value: objectMap.tagMap
        } });
        port.postMessage({ message: 'cachePiece', data: {
          key: 'commit',
          value: objectMap.kCommitMap
        } });

        for (let chunkKey in objectMap.kTreeMapChunks) {
          port.postMessage({ message: 'cachePiece', data: {
            key: 'tree',
            value: objectMap.kTreeMapChunks[chunkKey]
          } });
        }

        for (let chunkKey in objectMap.blobMapChunks) {
          port.postMessage({ message: 'cachePiece', data: {
            key: 'blob',
            value: objectMap.blobMapChunks[chunkKey]
          } });
        }

        port.postMessage({ message: 'cachePiece', data: {
          key: 'workspace',
          value: objectMap.workspaceMap
        } });

        port.postMessage({ id: request.id });
        break;

      case 'getItemUpdates':
        let updatesPromise = _itemUpdatesPromise;
        // Wait for any pending update to complete
        await updatesPromise;

        // Check for differences
        let response : any = {};

        let cwTreeHashes = TreeConfiguration.getWorkingTree().getAllTreeHashes();
        let tabTreeHashes: any = request.data.treeHashes;

        if(!_.isEqual(tabTreeHashes, cwTreeHashes)){
          console.log('--- KDB Does Not Match: Delta response required');

          let thmDiff = TreeHashMap.diff(tabTreeHashes, cwTreeHashes);

          response = {
              repoTreeHashes: cwTreeHashes,
              addItems: [],
              changeItems: [],
              deleteItems: []
          };

          for (let itemId in thmDiff.summary.itemAdded) {
            var proxy = _workingTree.getProxyFor(itemId);
            response.addItems.push({kind: proxy.kind, item: proxy.cloneItemAndStripDerived()});
          }

          for (let itemId in thmDiff.summary.contentChanged) {
            var proxy = _workingTree.getProxyFor(itemId);
            response.changeItems.push({kind: proxy.kind, item: proxy.cloneItemAndStripDerived()});
          }

          for (let itemId in thmDiff.summary.itemDeleted){
            response.deleteItems.push(itemId);
          }

        } else {
          console.log('--- KDB Matches: No changes required');
          response.kdbMatches = true;
        }


        port.postMessage({
          id: request.id,
          data: response
        });
        break;

      case 'getStatus':
        var idStatusArray = _workingTree.getVCStatus();

        port.postMessage({
          id: request.id,
          data: {
            statusCount: idStatusArray.length,
            idStatusArray: idStatusArray
          }
        });
        break;

      case 'connectionVerification':
        lastTabResponseTime = Date.now();
        if (port.koheseAssumedTabClosedUnexpectedly){
          setTimeout(() => {
            checkConnections();
          }, 5000);
          tabConnected(clientId, port);
          port.koheseAssumedTabClosedUnexpectedly = false;
        }
        break;

      case 'getSessionMap':
        port.postMessage({ id: request.id, data: await new Promise<any>(
          (resolve: (sessionMap: any) => void, reject: () => void) => {
          socket.emit('getSessionMap', {}, (sessionMap: any) => {
            resolve(sessionMap);
          });
        }) });
        break;

      case 'getIcons':
        port.postMessage({ id: request.id, data: await new Promise<any>(
          (resolve: (icons: Array<string>) => void, reject: () => void) => {
          socket.emit('getIcons', {}, (icons: Array<string>) => {
            resolve(icons);
        }); }) });
        break;

      case 'fetchItem':
        port.postMessage({id: request.id, data: await new Promise<any>(
          (resolve: (response: any) => void, reject: () => void) => {
            socket.emit('Item/findById', { id: request.data.id }, (response) => {
              let proxy = TreeConfiguration.getWorkingTree().getProxyFor(request.data.id);
              if (proxy && !response.error) {
                proxy.updateItem(response.kind, response.item);
              }
              resolve(response);
            });
          })
        });
        break;

      case 'upsertItem':
        port.postMessage({
          id: request.id,
          data: await upsertItem(request.data.kind, request.data.item)
        });
        break;

      case 'deleteItem':
        port.postMessage({
          id: request.id,
          data: await deleteItem(request.data.kind, request.data.id, request.data.recursive)
          });
        break;

      case 'performAnalysis':
        port.postMessage({
          id: request.id,
          data: await performAnalysis(request.data.kind,request.data.id)
        });
        break;

      case 'getUrlContent':
        port.postMessage({ id: request.id, data: await new Promise<any>(
          (resolve: (contentObject: any) => void, reject: () => void) => {
          socket.emit('getUrlContent', {
            url: request.data.url
        }, (contentObject: any) => {
          resolve(contentObject);
        }); }) });
        break;

      case 'convertToMarkdown':
        port.postMessage({ id: request.id, data: await new Promise<any>(
          (resolve: (markdown: string) => void, reject: () => void) => {
          socket.emit('convertToMarkdown', {
            content: request.data.content,
            contentType: request.data.contentType,
            parameters: request.data.parameters
        }, (markdown: string) => {
          resolve(markdown);
        }); }) });
        break;

      case 'importMarkdown':
        port.postMessage({ id: request.id, data: await new Promise<any>(
          (resolve: (value?: any) => void, reject: (reason?: any) => void) => {
          socket.emit('importMarkdown', { fileName: request.data.fileName,
            markdown: request.data.markdown, parentId: request.data.parentId },
            () => {
            resolve();
          });
        }) });
        break;

      case 'produceReport':
        port.postMessage({ id: request.id, data: await new Promise<any>(
          (resolve: (value?: any) => void, reject: (reason?: any) => void) => {
          socket.emit('Item/generateReport', { reportName: request.data.
            reportName, format: request.data.format, content: request.data.
            content }, () => {
            resolve();
          });
        }) });
        break;

      case 'getReportMetaData':
        port.postMessage({ id: request.id, data: await new Promise<any>(
          (resolve: (reportObjects: Array<any>) => void, reject:
          () => void) => {
          socket.emit('getReportMetaData', {}, (reportObjects: Array<any>) => {
            resolve(reportObjects);
          });
        }) });
        break;

      case 'renameReport':
        port.postMessage({ id: request.id, data: await new Promise<any>(
          (resolve: (value?: any) => void, reject: (reason?: any) => void) => {
          socket.emit('renameReport', { oldReportName: request.data.
          oldReportName, newReportName: request.data.newReportName }, () => {
            resolve();
          });
        }) });
        break;

      case 'getReportPreview':
        port.postMessage({ id: request.id, data: await new Promise<any>(
          (resolve: (reportPreview: string) => void, reject: () => void) => {
          socket.emit('getReportPreview', { reportName: request.data.
          reportName }, (reportPreview: string) => {
            resolve(reportPreview);
          });
        }) });
        break;

      case 'removeReport':
        port.postMessage({ id: request.id, data: await new Promise<any>(
          (resolve: (value?: any) => void, reject: (reason?: any) => void) => {
          socket.emit('removeReport', { reportName: request.data.reportName },
            () => {
            resolve();
          });
        }) });
        break;

      case 'VersionControl/stage':
      case 'VersionControl/unstage':
      case 'VersionControl/revert':
      case 'VersionControl/commit':
      case 'VersionControl/push':
      case 'VersionControl/addRemote':
      case 'VersionControl/getRemotes':
        socket.emit(request.type, request.data, (response) => {
          port.postMessage({ id: request.id, data: response});
        });
        break;

      case 'About/getCommitInfo':
        socket.emit(request.type, request.data, (response) => {
          port.postMessage({id: request.id, data: response});
        });
        break;

      case 'Repository/getAvailableRepositories':
        port.postMessage({ id: request.id, data: await new Promise<any>(
          (resolve: (availableRepositories: Array<any>) => void, reject:
          () => void) => {
          socket.emit('Repository/getAvailableRepositories', {}, (availableRepositories: Array<any>) => {
            resolve(availableRepositories);
          });
        }) });
        break;

      case 'Repository/refreshRepositories':
        port.postMessage({ id: request.id, data: await new Promise<any>(
          (resolve: (refreshedRepositories: boolean) => void, reject: () => void) => {
          socket.emit('Repository/refreshRepositories', {}, (refreshedRepositories: boolean) => {
            resolve(refreshedRepositories);
          });
        }) });
        break;

      case 'Repository/unMountRepository':
        port.postMessage({ id: request.id, data: await new Promise<any>(
          (resolve: (value?: any) => void, reject: (reason?: any) => void) => {
          socket.emit('Repository/unMountRepository', { repoId: request.data.id }, () => {
            resolve();
          });
        }) });
        break;

      case 'Repository/disableRepository':
        port.postMessage({ id: request.id, data: await new Promise<any>(
          (resolve: (value?: any) => void, reject: (reason?: any) => void) => {
          socket.emit('Repository/disableRepository', { repoId: request.data.id }, () => {
            resolve();
          });
        }) });
        break;

      case 'Repository/getDisabledRepositories':
        port.postMessage({ id: request.id, data: await new Promise<any>(
          (resolve: (disabledRepositories: Array<any>) => void, reject:
          () => void) => {
          socket.emit('Repository/getDisabledRepositories', {}, (disabledRepositories: Array<any>) => {
            resolve(disabledRepositories);
          });
        }) });
        break;

      case 'Repository/enableRepository':
        port.postMessage({ id: request.id, data: await new Promise<any>(
          (resolve: (value?: any) => void, reject: (reason?: any) => void) => {
          socket.emit('Repository/enableRepository', {repoId: request.data.id}, () => {
            resolve();
          });
        }) });
        break;

      case 'Repository/mountRepository':
        port.postMessage({ id: request.id, data: await new Promise<any>(
          (resolve: (value?: any) => void, reject: (reason?: any) => void) => {
          socket.emit('Repository/mountRepository', {kind: request.data.kind, id: request.data.id}, () => {
            resolve();
          });
        }) });
        break;

      case 'Repository/addRepository':
        port.postMessage({ id: request.id, data: await new Promise<any>(
          (resolve: (value?: any) => void, reject: (reason?: any) => void) => {
          socket.emit('Repository/addRepository',
            {repoId: request.data.id,
             parentId: request.data.parentId,
             timestamp: request.data.timestamp,
             username: request.data.username}, () => {
            resolve();
          });
        }) });
        break;

      default:
        console.log('$$$ Received unexpected event:' + request.type);
        console.log(event);
    }

    const requestFinishTime = Date.now();
    if (!_suppressWorkerEventAnnouncement) {
      console.log('^^^ Processing time for request ' + request.type + ' from tab ' + clientId
      + ' - ' + (requestFinishTime - requestStartTime) / 1000 + 's');
    }
  };

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  port.onmessageerror = function(event) {
    console.log('*** Received message error:');
    console.log(event);
  }

  port.start();

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  let checkConnections: () => void = () => {
    port.postMessage({message: 'verifyConnection', data: undefined});

    let timeSinceLastConnectionVerification = Date.now() - lastTabResponseTime;

    if (timeSinceLastConnectionVerification < 20000) {
      setTimeout(() => {
        checkConnections();
      }, 5000);
    } else {
      console.log('*** Tab failed to respond to connection request, assuming it has closed unexpectedly: ' + clientId);
      port.koheseAssumedTabClosedUnexpectedly = true;

      // Simulated sync failure in case tab reconnects
      port.postMessage({message: 'connectionError', data: {}});
      port.postMessage({message: 'reconnected', data: {}});

      // Notify Server tab is disconnected
      tabDisconnected(clientId);
    }
  };

  checkConnections();
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function tabConnected(clientId, port) {
  console.log("::: Notifying server that tab has connected: " + clientId);
  socket.emit('connectionAdded', {
    id: socket.id,
    clientTabId: clientId
  });
  clientMap[clientId] = port;
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function tabDisconnected(clientId) {
  if (clientMap[clientId]){
    console.log("::: Notifying server that tab is closing: " + clientId);
    socket.emit('connectionRemoved', {
      id: socket.id,
      clientTabId: clientId
    });
    delete clientMap[clientId];
  }
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
async function authenticate(authRequest): Promise<void> {
  return new Promise<void>((resolve: () => void, reject: () => void) => {
    socket.on('authenticated', async () => {
      console.log('^^^ Session authenticated');

      // Remove event listener for authenticated
      socket.off('authenticated');

      // Resolve the promise to allow all client tabs to proceed
      resolve();

      if(!kioListenersInitialized) {
        registerKoheseIOListeners();
        kioListenersInitialized = true;
      }

      // Begin synchronization process
      sync();
    });

    socket.on('userLockedOut', async () => {
      console.log ('^^^ Session user locked out');
      socket.disconnect();
      _userLockedOut = true;
      postToAllPorts('userLockedOut', {});
    });

    console.log('^^^ Requesting authentication');
    socket.emit('authenticate', {
      token: authRequest
    });
  });
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
async function sync(): Promise<void> {

  console.log('^^^ Sync initiated');
  let workingTree = TreeConfiguration.getWorkingTree();
  let beforeSync = Date.now();

  if (!_fundamentalItemsPromise){
    _fundamentalItemsPromise = synchronizeModels();
    await _fundamentalItemsPromise;
  }

  let afterSyncMetaModels = Date.now();
  console.log('^^^ Time to getMetaModels: ' + (afterSyncMetaModels - beforeSync) / 1000);

  let afterLoadWorking;
  let afterCalcTreeHashes;
  if (!_loadedCachePromise){
    _loadedCachePromise = populateCache();
    await _loadedCachePromise;

    let afterSyncCache = Date.now();
    console.log('^^^ Time to getItemCache: ' + (afterSyncCache - afterSyncMetaModels) / 1000);

    let treeRoots = await fetchRepoHashes();

    ItemProxy.displayCalcCounts();

    console.log('^^^ Checking for missing tree root data');
    let missingTreeRootData = await _cache.analysis.detectMissingTreeRootData(treeRoots);
    if (missingTreeRootData.found){
      console.log('*** Found missing cache data:');
      console.log(JSON.stringify(missingTreeRootData, null, '  '));
      let workingWorkspace = await _cache.getWorkspace('Working');
      if (workingWorkspace){
        console.log('^^^ Loading previous Working');
        await _cache.loadProxiesForTreeRoots(workingWorkspace, workingTree);
        afterLoadWorking = Date.now();
        console.log('^^^ Time to load previous Working: ' + (afterLoadWorking - afterSyncCache) / 1000);
      } else {
        console.log('^^^ Loading HEAD')
        let headRef = await _cache.getRef('HEAD');
        await _cache.loadProxiesForCommit(headRef, workingTree);
        afterLoadWorking = Date.now();
        console.log('^^^ Time to load HEAD: ' + (afterLoadWorking - afterSyncCache) / 1000);
      }

    } else {
      console.log('^^^ Loading current Working')
      await _cache.loadProxiesForTreeRoots(treeRoots, workingTree);
      afterLoadWorking = Date.now();
      console.log('^^^ Time to load Working: ' + (afterLoadWorking - afterSyncCache) / 1000);
    }

    ItemProxy.displayCalcCounts();

    await workingTree.loadingComplete(false);

    ItemProxy.displayCalcCounts();

    afterCalcTreeHashes = Date.now();
  } else {
    afterLoadWorking = Date.now();
    afterCalcTreeHashes = Date.now();
  }
  console.log('^^^ Time to calc treehashes: ' + (afterCalcTreeHashes - afterLoadWorking) / 1000);

  if (workingTree.loading) {
    // Previous sync is still in progress, provide a warning and let existing sync finish
    console.log("!!! Sync: Attempt to sync while previous sync was interrupted");
  } else {

    // TODO: Need to deal with loss of data on refresh
    _itemUpdatesPromise = updateWorking(workingTree.getAllTreeHashes());
    await _itemUpdatesPromise;
    let afterGetAll = Date.now();
    console.log('^^^ Time to get and load deltas: ' + (afterGetAll - afterCalcTreeHashes) / 1000);

    // Perform an update of the cache
    await workingTree.saveToCache();

    let afterSaveToCache = Date.now();
    console.log('^^^ Time to save working to cache: ' + (afterSaveToCache - afterGetAll) / 1000);

    // TODO: Need to handle refresh
    await getStatus();
    let afterGetStatus = Date.now();
    console.log('^^^ Time to get status: ' + (afterGetStatus - afterSaveToCache) / 1000);
    console.log('^^^ Total time to sync: ' + (afterGetStatus - beforeSync) / 1000);
  }
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
async function getStatus() : Promise<number> {
  return new Promise((resolve : (statusCount:number) => void, reject) => {
    console.log('^^^ Requesting getStatus from server')
    socket.emit('Item/getStatus', {
      repoId: TreeConfiguration.getWorkingTree().getRootProxy().item.id
    }, (response: Array<any>) => {
      let currentVCStatus = _workingTree.getVCStatus();
      let vcDiff = TreeConfiguration.compareVCStatus(currentVCStatus, response);
      console.log('::: Processing status response');
      for (let key in vcDiff) {
         let newStatus = vcDiff[key].to || [];
         updateItemStatus(key, newStatus)
      }
      console.log('^^^ Received getStatus response from server')
      resolve(response.length);
    });
  });

}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function repoStatusUpdate(status) {
  let currentVCStatus = _workingTree.getVCStatus();
  let vcDiff = TreeConfiguration.compareVCStatus(currentVCStatus, status);
  for (let key in vcDiff) {
    let newStatus = vcDiff[key].to || [];
    updateItemStatus(key, newStatus)
  }
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function registerKoheseIOListeners() {
  // Register the listeners for the Item kinds that are being tracked
  socket.on('Item/create', (notification) => {
    console.log('::: Received notification of ' + notification.kind + ' Created:  ' + notification.item.id);
    buildOrUpdateProxy(notification.item, notification.kind, notification.status);
  });

  socket.on('Item/update', (notification) => {
    console.log('::: Received notification of ' + notification.kind + ' Updated:  ' + notification.item.id);
    buildOrUpdateProxy(notification.item, notification.kind, notification.status);
  });

  socket.on('Repository/updateRepoStatus', (notification) => {
    console.log('::: Received notification of Mounted for ' + notification.id);
    repoStatusUpdate(notification.status);
  });

  socket.on('Item/delete', (notification) => {
    console.log('::: Received notification of ' + notification.kind + ' Deleted:  ' + notification.id);
    itemDeleted(notification);
  });

  socket.on('Item/BulkUpdate', (bulkUpdate) => {
    console.log('::: Received Bulk Update');
    processBulkUpdate(bulkUpdate);
  });

  socket.on('Item/BulkCacheUpdate', async (bulkCacheUpdate) => {
    console.log('::: Received Bulk Cache Update');
    await _cache.processBulkCacheUpdate(bulkCacheUpdate);
  });

  socket.on('VersionControl/statusUpdated', (statusMap: any) => {
    console.log('^^^ Status update received: ' + Object.keys(statusMap).length)
    for (var itemId in statusMap) {
      updateItemStatus(itemId, statusMap[itemId]);
    }
  });
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function buildOrUpdateProxy(item: any, kind: string, itemStatus: Array<string>, bulkUpdate: boolean = false):   ItemProxy {

  let proxy: ItemProxy = _workingTree.getProxyFor(item.id);

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

    // TODO: All change notifications need to be sent from ItemProxy

    TreeConfiguration.getWorkingTree().getChangeSubject().next({
      type: 'update',
      proxy: proxy
    });
  }

  if (!bulkUpdate) {
    postToAllPorts('update', { item: item, kind: kind, status: itemStatus });
  }

  return proxy;
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function updateItemStatus (itemId : string, itemStatus : Array<string>) {

  let proxy: ItemProxy = _workingTree.getProxyFor(itemId);

  let currentStatus = proxy.vcStatus.statusArray;
  if (currentStatus !== itemStatus) {
    // Process status that have changed
    if (proxy && itemStatus) {
      proxy.updateVCStatus(itemStatus);
    }

    postToAllPorts('updateItemStatus', { itemId: itemId, status: itemStatus });
  }

}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
async function deleteItem(kind, itemId, recursive): Promise<any> {
  console.log('::: Deleting: %s - %s - %s', kind, itemId, recursive);
  var promise = new Promise((resolve, reject) => {
    socket.emit('Item/deleteById', { kind: kind, id: itemId, recursive: recursive }, (response) => {
      resolve(response);
    });
  });
  return promise;
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function itemDeleted(notification: any): void {
  let proxy = TreeConfiguration.getWorkingTree().getProxyFor(notification.id);
  if (proxy){
    proxy.deleteItem();
    postToAllPorts('deletion', notification);
  }
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function postToAllPorts(message: string, data: any): void {
  console.log('^^^ Posting message to all ports: ' + message);
  for (let key in clientMap) {
    console.log('^^^ Posting message to port: ' + message + ' - ' + key);
    clientMap[key].postMessage({ message: message, data: data });
  }
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function synchronizeModels(): Promise<any> {
  console.log('$$$ Get Metamodel');
  let requestTime = Date.now();

  return new Promise<any>((resolve: (data: any) => void, reject:
    () => void) => {
    socket.emit('Item/getMetamodel', {
      timestamp: {
        requestTime: requestTime
      }
    },
    (response) => {
      var responseReceiptTime = Date.now();
      let timestamp = response.timestamp;
      timestamp.responseReceiptTime = responseReceiptTime;
      console.log(timestamp);
      console.log('::: Response for getMetamodel');
      for(let tsKey in timestamp){
        console.log('$$$ ' + tsKey + ': ' + (timestamp[tsKey]-requestTime));
      }

      processBulkUpdate(response);
      KoheseModel.modelDefinitionLoadingComplete();
      resolve(response);
    });
  });
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
async function fetchMissingCacheInformation(missingCacheData){
  const requestTime = Date.now();
  let promise = new Promise<any>((resolve: (value?: any) => void, reject: (reason?: any) => void) => {
    socket.emit('Item/getMissingCacheInfo', {
      timestamp: {
        requestTime: requestTime
      },
      missingCacheData: missingCacheData
    }, async (response) => {
      const responseReceiptTime = Date.now();
      const timestamp = response.timestamp;
      timestamp.responseReceiptTime = responseReceiptTime;
      console.log('::: Response for getMissingCacheInfo');
      // tslint:disable-next-line:forin
      for (const tsKey in timestamp) {
        console.log('$$$ ' + tsKey + ': ' + (timestamp[tsKey] - requestTime));
      }

      let cacheData = response.cacheData;

      console.log('$$$ Fetched missing cache info');
      if(cacheData.blob){
        for(let oid in cacheData.blob){
          console.log('^^^ Fetched missing blob: ' + oid);
          let blob = cacheData.blob[oid];
          _cache.cacheBlob(oid, blob);
        }
      }

      if(cacheData.tree){
        for(let treehash in cacheData.tree){
          console.log('^^^ Fetched missing tree: ' + treehash);
          let tree = cacheData.tree[treehash];
          _cache.cacheTree(treehash, tree);
        }
      }

      if(cacheData.root){
        for(let rootTreehash in cacheData.root){
          console.log('^^^ Fetched missing root: ' + rootTreehash);
          let root = cacheData.root[rootTreehash];
          _cache.cacheTree(rootTreehash, root);
        }
      }

      if(cacheData.commit){
        for(let commitId in cacheData.commit){
          console.log('^^^ Fetched missing commit: ' + commitId);
          let commit = cacheData.commit[commitId];
          _cache.cacheCommit(commitId, commit);
        }
      }

      await _cache.saveAllPendingWrites();
      resolve();
    });
  });

  await promise;
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
async function populateCache(): Promise<any> {
  console.log('$$$ Get Item Cache');

  await _cache.loadCachedObjects();
  let headCommit: string;
  let workingWorkspace: Workspace;
  let workingWorkspaceHashes = {};
  try {
    headCommit = await _cache.getRef('HEAD');
    workingWorkspace = await _cache.getWorkspace('Working');
    for (let repo in workingWorkspace) {
      workingWorkspaceHashes[repo] = workingWorkspace[repo].treeHash;
    }
  } catch (error) {
    headCommit = '';
  }

  const incrementalCacheLoad = true;
  console.log('$$$ Latest HEAD in client cache: ' + headCommit);
  const requestTime = Date.now();

  //////////////////////////////////////////////////////////////////////////
  async function fetchItemCache() {
    console.log('$$$ Fetching Item Cache');
    return new Promise<any>((resolve: (value?: any) => void, reject: (reason?: any) => void) => {
      socket.emit('Item/getItemCache', {
        timestamp: {
          requestTime: requestTime
        },
        incrementalCacheLoad: incrementalCacheLoad,
        headCommit: headCommit,
        workingWorkspaceHashes: workingWorkspaceHashes
      }, (response) => {
        const responseReceiptTime = Date.now();
        const timestamp = response.timestamp;
        timestamp.responseReceiptTime = responseReceiptTime;
        console.log(timestamp);
        console.log('::: Response for getItemCache');
        // tslint:disable-next-line:forin
        for (const tsKey in timestamp) {
          console.log('$$$ ' + tsKey + ': ' + (timestamp[tsKey] - requestTime));
        }
        console.log('$$$ Fetched Item Cache');
        if (response.incrementalDataToLoad){
          if (response.incrementalDataToLoad.HEAD){
            _cache.cacheRef('HEAD', response.incrementalDataToLoad.HEAD);
          }
        }
        resolve();
      });
    });
  }

  return new Promise<any>(async (resolve: (value?: any) => void, reject: (reason?: any) => void) => {
    if (incrementalCacheLoad) {
      console.log('$$$ Calling fetchItemCache incremental');
      await fetchItemCache();

      console.log('^^^ Checking for missing cache data');
      let missingCacheData = await _cache.analysis.detectAllMissingData();

      while (missingCacheData.found){
        console.log('*** Found missing cache data:');
        console.log(JSON.stringify(missingCacheData, null, '  '));
        await fetchMissingCacheInformation(missingCacheData);
        missingCacheData = await _cache.analysis.reevaluateMissingData();
        // TODO: Need to compare and exit if missing data can not be found
      }

      console.log('$$$ Getting tree roots');
      let repoTreeRoots = await fetchRepoHashes();

      console.log('^^^ Checking for missing tree root data')
      let missingTreeRootData = await _cache.analysis.detectMissingTreeRootData(repoTreeRoots);

      while (missingTreeRootData.found){
        console.log('*** Found missing tree root data:');
        console.log(JSON.stringify(missingTreeRootData, null, '  '));
        await fetchMissingCacheInformation(missingTreeRootData);
        missingTreeRootData = await _cache.analysis.reevaluateMissingData();
        // TODO: Need to compare and exit if missing data can not be found
      }

      let workingWorkspace = await _cache.getWorkspace('Working');
      if (!missingTreeRootData.found){
        if (workingWorkspace) {
          // TODO: check for difference

          _cache.cacheWorkspace('Working', repoTreeRoots);
        } else {
          // Store the workspace
          _cache.cacheWorkspace('Working', repoTreeRoots);
        }
      }

      _cache.saveAllPendingWrites();

      console.log('$$$ Got tree roots');
      console.log(repoTreeRoots);

      console.log('$$$ Return from fetchItemCache incremental');
      resolve();
    } else {
      console.log('$$$ Calling fetchItemCache');
      await fetchItemCache();
      console.log('$$$ Return from fetchItemCache');
      resolve();
    }
  });
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
async function fetchRepoHashes(): Promise<Workspace> {
    console.log('$$$ Fetching Repo Hashes');
    const fetchRequestTime = Date.now();
    return new Promise<any>((resolve, reject) => {
      socket.emit('Item/getRepoHashmap', {
        timestamp: {
          requestTime: fetchRequestTime
        },
      }, async (response) => {
        const responseReceiptTime = Date.now();
        console.log('$$$ Response for getRepoHashmap: ' + (responseReceiptTime - fetchRequestTime) / 1000);

        console.log('$$$ Fetched RepoHashMap');
        resolve(response.repoTreeHashes);
      });
    });
  }

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function processBulkUpdate(response: any): void {
  const before = Date.now();
  const isABulkUpdate: boolean = true;
  for(let kind in response.cache) {
    console.log('--- Processing ' + kind);
    let kindList: any = response.cache[kind];
    for (let id in kindList) {
      buildOrUpdateProxy(JSON.parse(kindList[id]), kind, undefined);
    }
  }

  if (response.addItems) {
    for (let j: number = 0; j < response.addItems.length; j++) {
      buildOrUpdateProxy(response.addItems[j].item, response.addItems[j].kind,
        undefined, isABulkUpdate);
    }
  }

  if (response.changeItems) {
    for (let j: number = 0; j < response.changeItems.length; j++) {
      buildOrUpdateProxy(response.changeItems[j].item, response.changeItems[j].
        kind, undefined, isABulkUpdate);
    }
  }

  if (response.deleteItems) {
    for (let j: number = 0; j < response.deleteItems.length; j++) {
      itemDeleted({ id: response.deleteItems[j] });
    }
  }
  const after = Date.now();
  console.log('^^^ processBulkUpdate took: ' + (after - before) / 1000 );
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function updateWorking(treeHashes: any): Promise<any> {
  return new Promise<any>((resolve: (data: any) => void, reject:
    () => void) => {
    console.log('^^^ Requesting item update');
    socket.emit('Item/getAll', { repoTreeHashes: treeHashes },
      (response) => {
      processBulkUpdate(response);
      resolve(response);
    });
  });
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function performAnalysis(kind: string, id: string) {
  console.log('::: Performing Analysis for %s - %s', kind, id);
  var promise = new Promise((resolve, reject) => {
    socket.emit('Item/performAnalysis', { kind: kind, id: id }, (response) => {
        resolve(response);
    });
  });

  return promise;
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
async function upsertItem(kind: string, item: any): Promise<any> {
  return new Promise<any>((resolve: ((value: ItemProxy) => void),
    reject: ((value: any) => void)) => {
    socket.emit('Item/upsert', {
      kind: kind,
      item: item
    }, (response: any) => {
      if (response.error) {
        console.log('*** Error: An error occurred while saving ' + item.name + '.');
      } else {
        let proxy: ItemProxy;
        if (!item.id) {
          // A new, created item will not have an id until the server responds.
          if (kind === 'KoheseModel') {
            proxy = new KoheseModel(response.item);
          } else if (kind === 'KoheseView') {
            proxy = new KoheseView(item, TreeConfiguration.getWorkingTree());
          } else {
            proxy = new ItemProxy(response.kind, response.item);
          }
        } else {
          proxy = TreeConfiguration.getWorkingTree().getProxyFor(item.id);
          proxy.updateItem(response.kind, response.item);
          proxy.dirty = false;
        }
      }
      resolve(response);
    });
  });
}
