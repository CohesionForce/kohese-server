console.log('$$$ Loading Cache Worker');

import * as SocketIoClient from 'socket.io-client';
import * as LevelJs from 'level-js';

import { ItemProxy } from '../../common/src/item-proxy';
import { TreeConfiguration } from '../../common/src/tree-configuration';
import { KoheseModel } from '../../common/src/KoheseModel';

import { ItemCache } from '../../common/src/item-cache';
import { LevelCache } from '../../common/src/level-cache';

let socket: SocketIOClient.Socket;

let authenticated : boolean = false;

let clientMap = {};

let initialized: boolean = false;
let _cache: LevelCache;
let _connectionAuthenticatedPromise: Promise<any>;
let _fundamentalItemsPromise: Promise<any>;
let _loadedCachePromise: Promise<any>;
let _itemUpdatesPromise: Promise<any>;

let _lastClientId :number = 0;

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

  let clientId = ++_lastClientId;
  clientMap[clientId] = port;

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  port.onmessage = async (event: any) => {
    let request = event.data;

    let requestStartTime = Date.now();
    console.log('^^^ Received request ' + request.type + ' from tab ' + clientId);

    // Determine which message handler to invoke
    switch(request.type){
      case 'connect':
        if (!socket) {
          socket = SocketIoClient();
          socket.on('connect_error', () => {
            console.log('*** Worker socket connection error');
            port.postMessage({ message: 'connectionError' });
          });
          socket.on('reconnect', async () => {
            await sync();
            port.postMessage({ message: 'reconnected' });
          });
          socket.connect();

          _connectionAuthenticatedPromise = new Promise<void>((resolve: () => void, reject:
            () => void) => {

            socket.on('authenticated', async () => {

              // Resolve the promise to allow all client tabs to proceed
              resolve();

              // Remaining initialization logic will proceed and provide incremental results to tabs
              registerKoheseIOListeners();
              sync();

            });
            socket.emit('authenticate', {
              token: request.data
            });
          });
        }

        await _connectionAuthenticatedPromise;
        port.postMessage({ id: request.id });
        break;
      case 'getFundamentalItems':
        if (!_fundamentalItemsPromise || request.data.refresh) {
          _fundamentalItemsPromise = synchronizeModels();
        }

        let fundamentalItems = await _fundamentalItemsPromise;

        port.postMessage({
          id: request.id,
          data: fundamentalItems
        });
        break;
      case 'getCache':
        if (!_loadedCachePromise || request.data.refresh) {
          _loadedCachePromise = populateCache();
        }

        let objectMap = await _loadedCachePromise;

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

        let itemUpdates = await updatesPromise;

        port.postMessage({
          id: request.id,
          data: itemUpdates
        });
        break;
      default:
        console.log('$$$ Received unexpected event:' + request.type);
        console.log(event);
    }

    let requestFinishTime = Date.now();
    console.log('^^^ Processing time for request ' + request.type + ' from tab ' + clientId
      + ' - ' + (requestFinishTime - requestStartTime)/1000 + 's');
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  port.onmessageerror = function(event) {
    console.log('*** Received message error:');
    console.log(event);
  }

  port.start();
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
    _cache.loadProxiesForCommit(_cache.getRef('HEAD'), workingTree);
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
  socket.emit('Item/getStatus', {
    repoId: TreeConfiguration.getWorkingTree().getRootProxy().item.id
  }, (response: Array<any>) => {
    for (let j: number = 0; j < response.length; j++) {
      buildOrUpdateProxy({ id: response[j].id }, undefined, response[j].
        status);
    }
  });

  // return new Promise<void>(async (resolve: () => void, reject: () => void) => {
  //   _fundamentalItemsObject = await synchronizeModels();
  //   _loadedCacheObjectMap = await populateCache();
  //   _itemUpdatesObject = await updateCache(TreeConfiguration.getWorkingTree().
  //     getAllTreeHashes());
  //   TreeConfiguration.getWorkingTree().loadingComplete(false);
  //   socket.emit('Item/getStatus', {
  //     repoId: TreeConfiguration.getWorkingTree().getRootProxy().item.id
  //   }, (response: Array<any>) => {
  //     for (let j: number = 0; j < response.length; j++) {
  //       buildOrUpdateProxy({ id: response[j].id }, undefined, response[j].
  //         status);
  //     }
  //   });
  //   resolve();
  // });
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
    buildOrUpdateProxy(notification.item, notification.kind, notification.
      status);
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

  socket.on('VersionControl/statusUpdated', (gitStatusMap: any) => {
    for (var id in gitStatusMap) {
      buildOrUpdateProxy({ id: id }, undefined, gitStatusMap[id]);
    }
  });
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function buildOrUpdateProxy(item: any, kind: string, status: Array<string>):
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

  if (proxy && status) {
    proxy.status.length = 0;
    proxy.status.push(...status);

    TreeConfiguration.getWorkingTree().getChangeSubject().next({
      type: 'update',
      proxy: proxy
    });
  }

  postToAllPorts('update', { item: item, kind: kind, status: status });

  return proxy;
}

function deleteItem(id: string): void {
  TreeConfiguration.getWorkingTree().getProxyFor(id).deleteItem();
  postToAllPorts('deletion', id);
}

function postToAllPorts(message: string, data: any): void {
  for (let key in clientMap) {
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
    headCommit = _cache.getRef('HEAD');
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
  let before = Date.now();
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
        undefined);
    }
  }

  if (response.changeItems) {
    for (let j: number = 0; j < response.changeItems.length; j++) {
      buildOrUpdateProxy(response.changeItems[j].item, response.changeItems[j].
        kind, undefined);
    }
  }

  if (response.deleteItems) {
    for (let j: number = 0; j < response.deleteItems.length; j++) {
      deleteItem(response.deleteItems[j]);
    }
  }
  let after = Date.now();
  console.log('^^^ processBulkUpdate took: ' + (after-before)/1000 );
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function updateCache(treeHashes: any): Promise<any> {
  return new Promise<any>((resolve: (data: any) => void, reject:
    () => void) => {
    socket.emit('Item/getAll', { repoTreeHashes: treeHashes },
      (response) => {
      processBulkUpdate(response);
      resolve(response);
    });
  });
}
