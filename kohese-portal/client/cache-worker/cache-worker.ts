console.log('$$$ Loading Cache Worker');

import * as SocketIoClient from 'socket.io-client';
import * as LevelJs from 'level-js';

import { ItemProxy } from '../../common/src/item-proxy';
import { TreeConfiguration } from '../../common/src/tree-configuration';
import { KoheseModel } from '../../common/src/KoheseModel';
import { LevelCache } from '../../common/src/level-cache';

let socket: SocketIOClient.Socket;
let clientMap = {};
let _connectionVerificationSet: Set<number> = new Set<number>();

let initialized: boolean = false;
let _cache: LevelCache;
let _fundamentalItemsObject: any;
let _loadedCacheObjectMap: any;
let _itemUpdatesObject: any;

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

  let clientId = Date.now();
  clientMap[clientId] = port;

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  port.onmessage = async (event: any) => {
    let request = event.data;

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
            await align();
            port.postMessage({ message: 'reconnected' });
          });
          socket.connect();
          await new Promise<void>((resolve: () => void, reject:
            () => void) => {
            socket.on('authenticated', async () => {
              registerKoheseIOListeners();
              await align();
              resolve();
            });
            socket.emit('authenticate', {
              token: request.data
            });
          });
        }
        
        socket.emit('connectionAdded', { id: socket.id });
        port.postMessage({ id: request.id });
        break;
      case 'getFundamentalItems':
        if (!_fundamentalItemsObject || request.data.refresh) {
          _fundamentalItemsObject = await synchronizeModels();
        }
        
        port.postMessage({
          id: request.id,
          data: _fundamentalItemsObject
        });
        break;
      case 'getCache':
        if (!_loadedCacheObjectMap || request.data.refresh) {
          _loadedCacheObjectMap = await populateCache();
        }
        
        port.postMessage({ message: 'cachePiece', data: {
          key: 'metadata',
          value: _loadedCacheObjectMap.metadata
        } });
        port.postMessage({ message: 'cachePiece', data: {
          key: 'ref',
          value: _loadedCacheObjectMap.refMap
        } });
        port.postMessage({ message: 'cachePiece', data: {
          key: 'tag',
          value: _loadedCacheObjectMap.tagMap
        } });
        port.postMessage({ message: 'cachePiece', data: {
          key: 'commit',
          value: _loadedCacheObjectMap.kCommitMap
        } });
        for (let chunkKey in _loadedCacheObjectMap.kTreeMapChunks) {
          port.postMessage({ message: 'cachePiece', data: {
            key: 'tree',
            value: _loadedCacheObjectMap.kTreeMapChunks[chunkKey]
          } });
        }
        for (let chunkKey in _loadedCacheObjectMap.blobMapChunks) {
          port.postMessage({ message: 'cachePiece', data: {
            key: 'blob',
            value: _loadedCacheObjectMap.blobMapChunks[chunkKey]
          } });
        }
        
        port.postMessage({ id: request.id });
        break;
      case 'getItemUpdates':
        if (!_itemUpdatesObject || request.data.refresh) {
          let treeHashes: any = request.data.treeHashes;
          if (!treeHashes) {
            treeHashes = TreeConfiguration.getWorkingTree().getAllTreeHashes();
          }
          
          _itemUpdatesObject = await updateCache(treeHashes);
        }
        
        port.postMessage({
          id: request.id,
          data: _itemUpdatesObject
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
      default:
        console.log('$$$ Received unexpected event:' + request.type);
        console.log(event);
    }
  }

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
    if (3 === connectionVerificationAttempts) {
      for (let id in clientMap) {
        if (!_connectionVerificationSet.has(+id)) {
          delete clientMap[id];
          socket.emit('connectionRemoved', { id: socket.id });
        }
      }
      _connectionVerificationSet.clear();
      connectionVerificationAttempts = 0;
    }
    connectionVerificationAttempts++;
    setTimeout(() => {
      checkConnections();
    }, 7000);
  };
  checkConnections();
}

function align(): Promise<void> {
  return new Promise<void>(async (resolve: () => void, reject: () => void) => {
    _fundamentalItemsObject = await synchronizeModels();
    _loadedCacheObjectMap = await populateCache();
    _itemUpdatesObject = await updateCache(TreeConfiguration.getWorkingTree().
      getAllTreeHashes());
    TreeConfiguration.getWorkingTree().loadingComplete(false);
    socket.emit('Item/getStatus', {
      repoId: TreeConfiguration.getWorkingTree().getRootProxy().item.id
    }, (response: Array<any>) => {
      for (let j: number = 0; j < response.length; j++) {
        buildOrUpdateProxy({ id: response[j].id }, undefined, response[j].
          status);
      }
    });
    resolve();
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

  if (proxy) {
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
      
      _cache.loadProxiesForCommit(headCommit, TreeConfiguration.
        getWorkingTree());
      resolve(_cache.getObjectMap());
    });
  });
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function processBulkUpdate(response: any): void {
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
