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
let sublevelMap: Map<string, any> = new Map<string, any>();
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
            socket = undefined;
          });
          socket.connect();
          await new Promise<void>((resolve: () => void, reject:
            () => void) => {
            socket.on('authenticated', async () => {
              registerKoheseIOListeners();
              
              _fundamentalItemsObject = await synchronizeModels();
              await populateCache();
              _cache.loadProxiesForCommit(_cache.getRef('HEAD'),
                TreeConfiguration.getWorkingTree());
              _loadedCacheObjectMap = _cache.getObjectMap();
              _itemUpdatesObject = await updateCache(TreeConfiguration.
                getWorkingTree().getAllTreeHashes());
              resolve();
            });
            socket.emit('authenticate', {
              token: request.data
            });
          });
        }
        
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
          await populateCache();
         _cache.loadProxiesForCommit(_cache.getRef('HEAD'), TreeConfiguration.
           getWorkingTree());
         _loadedCacheObjectMap = _cache.getObjectMap();
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
          _itemUpdatesObject = await updateCache(TreeConfiguration.
            getWorkingTree().getAllTreeHashes());
        }
        
        port.postMessage({
          id: request.id,
          data: _itemUpdatesObject
        });
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
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function registerKoheseIOListeners() {

  // Register the listeners for the Item kinds that are being tracked
  socket.on('Item/create', (notification) => {
    console.log('::: Received notification of ' + notification.kind + ' Created:  ' + notification.item.id);
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

    console.log('@@@ updateStatus: ');
    console.log(notification.status);
    // this.updateStatus(proxy, notification.status);
    proxy.dirty = false;
  });

  socket.on('Item/update', (notification) => {
    console.log('::: Received notification of ' + notification.kind + ' Updated:  ' + notification.item.id);
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

    console.log('@@@ updateStatus: ');
    console.log(notification.status);
    // this.updateStatus(proxy, notification.status);
    proxy.dirty = false;
  });
  
  socket.on('Item/delete', (notification) => {
    console.log('::: Received notification of ' + notification.kind + ' Deleted:  ' + notification.id);
    var proxy = ItemProxy.getWorkingTree().getProxyFor(notification.id);
    proxy.deleteItem();
  });

  socket.on('Item/BulkUpdate', (bulkUpdate) => {
    console.log('::: Received Bulk Update');
    processBulkUpdate(bulkUpdate);
  });

  socket.on('Item/BulkCacheUpdate', (bulkCacheUpdate) => {
    console.log('::: Received Bulk Cache Update');
    _cache.processBulkCacheUpdate(bulkCacheUpdate);
  });

  socket.on('VersionControl/statusUpdated', (gitStatusMap) => {
    for (var id in gitStatusMap) {
      var proxy = ItemProxy.getWorkingTree().getProxyFor(id);

      console.log('@@@ statusUpdate: ');
      console.log(gitStatusMap);
      // this.updateStatus(proxy, gitStatusMap[id]);
    }
  });

  socket.on('reconnect', () => {
    // TODO Remove CurrentUserService

    // if (this.CurrentUserService.getCurrentUserSubject().getValue()) {
    //   console.log('::: IR: this.authenticationService already authenticated');
    //   this.fetchItems();
    //   this.toastrService.success('Reconnected!', 'Server Connection!');
    // } else {
    //   console.log('::: IR: Listening for this.authenticationService authentication');
    //   let subscription: Subscription = this.CurrentUserService.getCurrentUserSubject()
    //     .subscribe((decodedToken) => {
    //       if(decodedToken) {
    //         console.log('::: IR: Socket Authenticated');
    //         this.fetchItems();
    //         this.toastrService.success('Reconnected!', 'Server Connection!');
    //         subscription.unsubscribe();
    //       }

    //   });
    // }
  });
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
    },
    async (response) => {
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
function processBulkUpdate(response){
  for(let kind in response.cache) {
    console.log('--- Processing ' + kind);
    var kindList = response.cache[kind];
    for (var index in kindList) {
      let item = JSON.parse(kindList[index]);
      let iProxy;
      if (kind === 'KoheseModel'){
        iProxy = new KoheseModel(item);
      } else {
        iProxy = new ItemProxy(kind, item);
      }
    }
    if (kind === 'KoheseView'){
      KoheseModel.modelDefinitionLoadingComplete();
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

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function updateCache(treeHashes: any): Promise<any> {
  return new Promise<any>((resolve: (data: any) => void, reject:
    () => void) => {
    socket.emit('Item/getAll', { repoTreeHashes: treeHashes },
      (response) => {
      processBulkUpdate(response);
      TreeConfiguration.getWorkingTree().loadingComplete();
      resolve(response);
    });
  });
}
