console.log('$$$ Loading Cache Worker');

import * as SocketIoClient from 'socket.io-client';
import * as LevelJs from 'level-js';

import { ItemProxy } from '../../common/src/item-proxy';
import { TreeConfiguration } from '../../common/src/tree-configuration';
import { KoheseModel } from '../../common/src/KoheseModel';
import { LevelCache } from '../../common/src/level-cache';

let socket: SocketIOClient.Socket;
let clientMap = {};
let _authRequest = {};
let _connectionVerificationSet: Set<number> = new Set<number>();

let initialized: boolean = false;
let _cache: LevelCache;
let _connectionAuthenticatedPromise: Promise<any>;
let _fundamentalItemsPromise: Promise<any>;
let _loadedCachePromise: Promise<any>;
let _itemUpdatesPromise: Promise<any>;

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

  if (!initialized) {
    _cache = new LevelCache(LevelJs('item-cache'));
    TreeConfiguration.setItemCache(_cache);
    initialized = true;
  }

  const clientId = ++_lastClientId;
  clientMap[clientId] = port;

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  port.onmessage = async (event: any) => {
    const request = event.data;

    const requestStartTime = Date.now();
    console.log('^^^ Received request ' + request.type + ' from tab ' + clientId);

    // Determine which message handler to invoke
    switch (request.type) {
      case 'connect':
        if (!socket) {
          socket = SocketIoClient();
          socket.on('connect_error', () => {
            console.log('*** Worker socket connection error');
            postToAllPorts('connectionError', {});
          });
          socket.on('reconnect', async () => {
            console.log('^^^ Socket reconnected');
            _connectionAuthenticatedPromise = authenticate(_authRequest);
            await _connectionAuthenticatedPromise;

            await sync();
            postToAllPorts('reconnected', {});
          });
          socket.connect();

          _authRequest = request.data;
          _connectionAuthenticatedPromise = authenticate(_authRequest);
        }

        await _connectionAuthenticatedPromise;
        socket.emit('connectionAdded', { id: socket.id });
        port.postMessage({ id: request.id });
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

        const objectMap = await _loadedCachePromise;

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

        port.postMessage({ id: request.id });
        break;
      case 'getItemUpdates':
        let updatesPromise = _itemUpdatesPromise;
        if (!_itemUpdatesPromise || request.data.refresh) {
          console.log('^^^ Request refresh of itemUpdates');
          let treeHashes: any = request.data.treeHashes;
          if (!treeHashes) {
            treeHashes = TreeConfiguration.getWorkingTree().getAllTreeHashes();
          }

          updatesPromise = updateCache(treeHashes);
          if (!request.data.refresh){
            console.log('^^^ Updating _itemUpdatesPromise');
            _itemUpdatesPromise = updatesPromise;
          }
        }

        const itemUpdates = await updatesPromise;

        port.postMessage({
          id: request.id,
          data: itemUpdates
        });
        break;
      case 'getStatus':
        const statusCount = await getStatus();
        port.postMessage({
          id: request.id,
          data: {statusCount: statusCount}
        });

        break;
      case 'connectionVerification':
        _connectionVerificationSet.add(clientId);
        break;
      case 'getSessionMap':
        port.postMessage({ id: request.id, data: await new Promise<any>(
          (resolve: (sessionMap: any) => void, reject: () => void) => {
          socket.emit('getSessionMap', {}, (sessionMap: any) => {
            resolve(sessionMap);
          });
        }) });
        break;
      case 'produceReport':
        port.postMessage({ id: request.id, data: await new Promise<any>(
          (resolve: () => void, reject: () => void) => {
          socket.emit('Item/generateReport', { reportName: request.data.
            reportName, format: request.data.format, content: request.data.
            content }, () => {
            resolve();
          });
        }) });
        break;
      case 'getReportNames':
        port.postMessage({ id: request.id, data: await new Promise<any>(
          (resolve: (reportNames: Array<string>) => void, reject:
          () => void) => {
          socket.emit('getReportNames', {}, (reportNames: Array<string>) => {
            resolve(reportNames);
          });
        }) });
        break;
      case 'removeReport':
        port.postMessage({ id: request.id, data: await new Promise<any>(
          (resolve: () => void, reject: () => void) => {
          socket.emit('removeReport', { reportName: request.data.reportName },
            () => {
            resolve();
          });
        }) });
        break;
      default:
        console.log('$$$ Received unexpected event:' + request.type);
        console.log(event);
    }

    const requestFinishTime = Date.now();
    console.log('^^^ Processing time for request ' + request.type + ' from tab ' + clientId
      + ' - ' + (requestFinishTime - requestStartTime) / 1000 + 's');
  };

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  port.onmessageerror = function(event) {
    console.log('*** Received message error:');
    console.log(event);
  }

  port.start();

  let connectionVerificationAttempts: number = 0;
  let checkConnections: () => void = () => {
    postToAllPorts('verifyConnection', undefined);

    // TODO: Need to update lost connection logic

    // if (3 === connectionVerificationAttempts) {
    //   for (let id in clientMap) {
    //     if (!_connectionVerificationSet.has(+id)) {
    //       delete clientMap[id];
    //       socket.emit('connectionRemoved', { id: socket.id });
    //     }
    //   }
    //   _connectionVerificationSet.clear();
    //   connectionVerificationAttempts = 0;
    // }
    // connectionVerificationAttempts++;
    // setTimeout(() => {
    //   checkConnections();
    // }, 7000);
  };
  checkConnections();
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
async function authenticate(authRequest): Promise<void> {
  return new Promise<void>((resolve: () => void, reject: () => void) => {
    socket.on('authenticated', async () => {
      // Resolve the promise to allow all client tabs to proceed
      resolve();
      // Remaining initialization logic will proceed and provide incremental results to tabs
      registerKoheseIOListeners();
      sync();
    });
    socket.emit('authenticate', {
      token: authRequest
    });
  });
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
async function sync(): Promise<void> {

  let workingTree = TreeConfiguration.getWorkingTree();
  let beforeSync = Date.now();

  if (!_fundamentalItemsPromise){
    _fundamentalItemsPromise = synchronizeModels();
    await _fundamentalItemsPromise;
  }

  let afterSyncMetaModels = Date.now();
  console.log('^^^ Time to getMetaModels: ' + (afterSyncMetaModels - beforeSync) / 1000);

  let afterLoadHead;
  let afterCalcTreeHashes;
  if (!_loadedCachePromise){
    _loadedCachePromise = populateCache();
    await _loadedCachePromise;
    let afterSyncCache = Date.now();
    console.log('^^^ Time to getItemCache: ' + (afterSyncCache - afterSyncMetaModels) / 1000);
    let headRef = await _cache.getRef('HEAD');
    await _cache.loadProxiesForCommit(headRef, workingTree);
    afterLoadHead = Date.now();
    console.log('^^^ Time to load HEAD: ' + (afterLoadHead - afterSyncCache) / 1000);
    workingTree.calculateAllTreeHashes();
    afterCalcTreeHashes = Date.now();
  } else {
    afterLoadHead = Date.now();
    afterCalcTreeHashes = Date.now();
  }
  console.log('^^^ Time to calc treehashes: ' + (afterCalcTreeHashes - afterLoadHead) / 1000);

  // TODO: Need to deal with loss of data on refresh
  _itemUpdatesPromise = updateCache(workingTree.getAllTreeHashes());
  await _itemUpdatesPromise;
  let afterGetAll = Date.now();
  console.log('^^^ Time to get and load deltas: ' + (afterGetAll - afterCalcTreeHashes) / 1000);
  workingTree.loadingComplete(false);
  let afterLoading = Date.now();
  console.log('^^^ Time to complete loading: ' + (afterLoading - afterGetAll) / 1000);
  console.log('^^^ Total time to sync: ' + (afterLoading - beforeSync) / 1000);

  // TODO: Need to handle refresh
  await getStatus();
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
async function getStatus() : Promise<number> {
  return new Promise((resolve : (statusCount:number) => void, reject) => {
    socket.emit('Item/getStatus', {
      repoId: TreeConfiguration.getWorkingTree().getRootProxy().item.id
    }, (response: Array<any>) => {
      for (let j: number = 0; j < response.length; j++) {
        updateItemStatus(response[j].id, response[j].status);
      }
      resolve(response.length);
    });
  });

}
//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function registerKoheseIOListeners() {
  // Register the listeners for the Item kinds that are being tracked
  socket.on('Item/create', (notification) => {
    console.log('::: Received notification of ' + notification.kind + ' Created:  ' + notification.item.id);
    buildOrUpdateProxy(notification.item, notification.kind, notification.
      status);
  });

  socket.on('Item/update', (notification) => {
    console.log('::: Received notification of ' + notification.kind + ' Updated:  ' + notification.item.id);
    buildOrUpdateProxy(notification.item, notification.kind, notification.status);
  });

  socket.on('Item/delete', (notification) => {
    console.log('::: Received notification of ' + notification.kind + ' Deleted:  ' + notification.id);
    deleteItem(notification.id);
  });

  socket.on('Item/BulkUpdate', (bulkUpdate) => {
    console.log('::: Received Bulk Update');
    processBulkUpdate(bulkUpdate);
  });

  socket.on('Item/BulkCacheUpdate', (bulkCacheUpdate) => {
    console.log('::: Received Bulk Cache Update');
    _cache.processBulkCacheUpdate(bulkCacheUpdate);
  });

  socket.on('VersionControl/statusUpdated', (statusMap: any) => {
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

  if (proxy && itemStatus) {
    proxy.updateVCStatus(itemStatus);

    // TODO: All change notifications need to be sent from ItemProxy

    TreeConfiguration.getWorkingTree().getChangeSubject().next({
      type: 'update',
      proxy: proxy
    });
  }

  postToAllPorts('updateItemStatus', { itemId: itemId, status: itemStatus });

}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function deleteItem(id: string): void {
  TreeConfiguration.getWorkingTree().getProxyFor(id).deleteItem();
  postToAllPorts('deletion', id);
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
      resolve(response);
    });
  });
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
async function populateCache(): Promise<any> {
  console.log('$$$ Get Item Cache');
  let requestTime = Date.now();

  await _cache.loadCachedObjects();
  let headCommit: string;
  try {
    headCommit = await _cache.getRef('HEAD');
  } catch (error) {
    headCommit = '';
  }

  console.log('$$$ Latest HEAD in client cache: ' + headCommit);
  return new Promise<any>((resolve: (objectMap: any) => void, reject:
    () => void) => {
    socket.emit('Item/getItemCache', {
      timestamp: {
        requestTime: requestTime
      },
      headCommit: headCommit
    }, (response) => {
      var responseReceiptTime = Date.now();
      let timestamp = response.timestamp;
      timestamp.responseReceiptTime = responseReceiptTime;
      console.log(timestamp);
      console.log('::: Response for getItemCache');
      for(let tsKey in timestamp){
        console.log('$$$ ' + tsKey + ': ' + (timestamp[tsKey]-requestTime));
      }
      resolve(_cache.getObjectMap());
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

    if (kind === 'KoheseView') {
      KoheseModel.modelDefinitionLoadingComplete();
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
      deleteItem(response.deleteItems[j]);
    }
  }
  const after = Date.now();
  console.log('^^^ processBulkUpdate took: ' + (after - before) / 1000 );
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function updateCache(treeHashes: any): Promise<any> {
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
