console.log('$$$ Loading Cache Worker');

import * as SocketIoClient from 'socket.io-client';
import * as LevelUp from 'levelup';
import * as LevelJs from 'level-js';
import * as SubLevelDown from 'subleveldown';

import { ItemProxy } from '../../common/src/item-proxy';
import { TreeConfiguration } from '../../common/src/tree-configuration';
import { KoheseModel } from '../../common/src/KoheseModel';
import { ItemCache } from '../../common/src/item-cache';

enum CacheSublevel {
  METADATA = 'metadata',
  REF = 'ref',
  TAG = 'tag',
  K_COMMIT = 'kCommit',
  K_TREE = 'kTree',
  BLOB = 'blob'
}

const CacheBulkTransferKeyToSublevelMap = {
  'metadata': CacheSublevel.METADATA,
  'refMap': CacheSublevel.REF,
  'tagMap': CacheSublevel.TAG,
  'kCommitMap': CacheSublevel.K_COMMIT,
  'kTreeMap': CacheSublevel.K_TREE,
  'blobMap': CacheSublevel.BLOB,
}

let socket: SocketIOClient.Socket;

let authenticated : boolean = false;

let clientMap = {};

let initialized: boolean = false;
let sublevelMap: Map<string, any> = new Map<string, any>();
let cache: ItemCache;

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
    cache = new ItemCache();
    TreeConfiguration.setItemCache(cache);
    let historySublevels: Array<string> = Object.keys(CacheSublevel);
    let historyDatabase: any = LevelUp(LevelJs('item-cache'));
    for (let j: number = 0; j < historySublevels.length; j++) {
      sublevelMap.set(CacheSublevel[historySublevels[j]], SubLevelDown(
        historyDatabase, CacheSublevel[historySublevels[j]],
        { valueEncoding: 'json' }));
    }

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
          socket.on('authenticated', async () => {
            registerKoheseIOListeners();
            
            let synchronizeModelsValue: any = await synchronizeModels();
            port.postMessage({
              message: 'modelsRetrieved',
              data: synchronizeModelsValue
            });
            await populateCache();
            cache.loadProxiesForCommit(cache.getRef('HEAD'), TreeConfiguration.
              getWorkingTree());
            let updateCacheValue: any = await updateCache(TreeConfiguration.
              getWorkingTree().getAllTreeHashes());
            let objectMap: any = cache.getObjectMap();
            port.postMessage({ message: 'cacheUpdate', data: {
              key: 'metadata',
              value: objectMap.metadata
            } });
            port.postMessage({ message: 'cacheUpdate', data: {
              key: 'ref',
              value: objectMap.refMap
            } });
            port.postMessage({ message: 'cacheUpdate', data: {
              key: 'tag',
              value: objectMap.tagMap
            } });
            port.postMessage({ message: 'cacheUpdate', data: {
              key: 'commit',
              value: objectMap.kCommitMap
            } });
            for (let chunkKey in objectMap.kTreeMapChunks) {
              port.postMessage({ message: 'cacheUpdate', data: {
                key: 'tree',
                value: objectMap.kTreeMapChunks[chunkKey]
              } });
            }
            for (let chunkKey in objectMap.blobMapChunks) {
              port.postMessage({ message: 'cacheUpdate', data: {
                key: 'blob',
                value: objectMap.blobMapChunks[chunkKey]
              } });
            }
            
            port.postMessage({
              message: 'initialized',
              data: updateCacheValue
            });
          });
          socket.emit('authenticate', {
            token: request.data
          });
        }
        break;
      case 'synchronizeModels':
        port.postMessage({ id: request.id, data: await synchronizeModels() });
        break;
      case 'populateCache':
        port.postMessage({
          id: request.id,
          data: await populateCache()
        });
        break;
      case 'updateCache':
        port.postMessage({
          id: request.id,
          data: await updateCache(request.data.treeHashes)
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
    processBulkCacheUpdate(bulkCacheUpdate);
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

  let headCommit: string;
  try {
    headCommit = await sublevelMap.get(CacheSublevel.REF).
      get('HEAD');
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
      let historySublevels: Array<string> = Object.keys(CacheSublevel);
      let beforeLoadCache = Date.now();
      for (let j: number = 0; j < historySublevels.length; j++) {
        let iterator: any = sublevelMap.get(CacheSublevel[
          historySublevels[j]]).iterator();
        let entry: any = await new Promise<any>((resolve: (entry: any) => void,
          reject: (error: any) => void) => {
          iterator.next((nullValue: any, key: string, value: any) => {
            resolve({
              key: key,
              value: value
            });
          });
        });
        while (entry.key) {
          switch (CacheSublevel[historySublevels[j]]) {
            case CacheSublevel.REF:
              cache.cacheRef(entry.key, entry.value);
              break;
            case CacheSublevel.TAG:
              cache.cacheTag(entry.key, entry.value);
              break;
            case CacheSublevel.K_COMMIT:
              cache.cacheCommit(entry.key, entry.value);
              break;
            case CacheSublevel.K_TREE:
              cache.cacheTree(entry.key, entry.value);
              break;
            case CacheSublevel.BLOB:
              cache.cacheBlob(entry.key, entry.value);
              break;
          }
          entry = await new Promise<any>((resolve: (entry: any) => void,
            reject: (error: any) => void) => {
            iterator.next((nullValue: any, key: string, value: any) => {
              resolve({
                key: key,
                value: value
              });
            });
          });
        }
      }
      let afterLoadCache = Date.now();
      console.log('$$$ Load time from Level Cache: ' + (afterLoadCache - beforeLoadCache)/1000);
      
      resolve(cache.getObjectMap());
    });
  });
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function processBulkCacheUpdate(bulkUpdate){

  for (let key in bulkUpdate){
    console.log("::: Processing BulkCacheUpdate for: " + key);
    let entries: Array<any> = [];
    for (let propertyName in bulkUpdate[key]) {
      entries.push({
        type: 'put',
        key: propertyName,
        value: bulkUpdate[key][propertyName]
      });
    }

    let sublevelKey : CacheSublevel = CacheBulkTransferKeyToSublevelMap[key];
    let sublevel = sublevelMap.get(sublevelKey);

    console.log('$$$ Adding ' + entries.length + ' entries to ' + sublevelKey + ' for ' + key);
    sublevel.batch(entries);
  }

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
