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

let socket : SocketIOClient.Socket = SocketIoClient();
let serverCache = {
  metaModel: undefined,
  allItems: undefined
}
let cacheFetched = false;

enum RepoStates {
  DISCONNECTED,
  SYNCHRONIZING,
  SYNCHRONIZATION_FAILED,
  SYNCHRONIZATION_SUCCEEDED
};

let repoState : RepoStates = RepoStates.DISCONNECTED;

let authenticated : boolean = false;

let clientMap = {};

let repoSyncCallback = [];

let initialized: boolean = false;
let sublevelMap: Map<string, any> = new Map<string, any>();

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

  // Notify all client tabs that a new client connected
  postMessageToAllClients({type: 'newClient', clientId: clientId});

  clientMap[clientId] = port;

  console.log('$$$ Client List:');
  console.log(clientMap);

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  port.onmessage = (event: any) => {
    let request = event.data;

    // Determine which message handler to invoke
    switch(request.type){
      case 'processAuthToken':
        processAuthToken(port, request);
        break;
      case 'getItemCache':
      console.log('$$$ getItemCache');
        // fetchItemCache();
        break;
      case 'sync':
        console.log('$$$ sync');

        syncWithServer(
          (response) => {
            let itemCache:ItemCache = TreeConfiguration.getItemCache();
            let objectMap = itemCache.getObjectMap();
            function sendBulkCacheUpdate(key, value){
              let bulkUpdateMessage = {};
              bulkUpdateMessage[key] = value;
              port.postMessage({type: 'bulkCacheUpdate', chunk: bulkUpdateMessage});
            }

            // Send Cache Chunks
            sendBulkCacheUpdate('metadata', objectMap['metadata']);
            sendBulkCacheUpdate('refMap', objectMap['refMap']);
            sendBulkCacheUpdate('tagMap', objectMap['tagMap']);
            sendBulkCacheUpdate('kCommitMap', objectMap['kCommitMap']);
            for (let key in objectMap.kTreeMapChunks) {
              sendBulkCacheUpdate('kTreeMap', objectMap['kTreeMapChunks'][key]);
            }
            for (let key in objectMap.blobMapChunks) {
              sendBulkCacheUpdate('blobMap', objectMap['blobMapChunks'][key]);
            }

            // Send Final response
            port.postMessage({type: 'sync', requestId: request.requestId, response: response});
          }
        );
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
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function postMessageToAllClients(message){
  for(let clientId in clientMap){
    let clientPort = clientMap[clientId];
    clientPort.postMessage(message);
  }
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function processAuthToken(port, request){
  console.log('::: Processing Authorization Request');
  if (authenticated){
    console.log('::: Cache Worker is already authenticated');
  } else {
    // Cache Worker is not authenticated yet, so open the socket
    console.log(request);
    socket.connect();
    socket.emit('authenticate', {
      token: request.authToken
    });
    socket.on('authenticated', function () {
      console.log('::: Item Cache Worker is authenticated');
      authenticated = true;

      registerKoheseIOListeners();

    });
    socket.on('connect_error', () => {
      console.log('*** CW: Socket IO Connection Error');
      authenticated = false;
    });
  }
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

  socket.on('connect_error', () => {
    console.log('@@@ ::: IR: Socket IO Connection Error');
    // this.repositoryStatus.next({
    //   state: RepoStates.DISCONNECTED,
    //   message : 'Error connecting to repository'
    // })
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
function getMetamodel(){
  if (!cacheFetched){
    console.log('$$$ Get Metamodel');
    let requestTime = Date.now();

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
      serverCache.metaModel = response.cache;

      console.log('$$$ Loading Metamodel');
      processBulkUpdate(response);

      getItemCache();
    });
  } else {
    console.log('$$$ Cache has already been fetched');
  }
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
async function getItemCache(){
  if (!cacheFetched){
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
      let itemCache: ItemCache = new ItemCache();
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
              itemCache.cacheRef(entry.key, entry.value);
              break;
            case CacheSublevel.TAG:
              itemCache.cacheTag(entry.key, entry.value);
              break;
            case CacheSublevel.K_COMMIT:
              itemCache.cacheCommit(entry.key, entry.value);
              break;
            case CacheSublevel.K_TREE:
              itemCache.cacheTree(entry.key, entry.value);
              break;
            case CacheSublevel.BLOB:
              itemCache.cacheBlob(entry.key, entry.value);
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
      TreeConfiguration.setItemCache(itemCache);
      let headCommit = itemCache.getRef('HEAD');
      console.log('### Head: ' + headCommit);
      cacheFetched = true;

      // TODO Need to load the HEAD commit
      console.log('$$$ Loading HEAD Commit');
      let workingTree = TreeConfiguration.getWorkingTree();
      let before = Date.now();
      itemCache.loadProxiesForCommit(headCommit, workingTree);
      let after = Date.now();
      console.log('$$$ Load took: ' + (after-before)/1000);
      before = Date.now();
      workingTree.calculateAllTreeHashes();
      after = Date.now();
      console.log('$$$ Calc took: ' + (after-before)/1000);

      console.log('$$$ Finished loading HEAD');

      getAll();
    });
  } else {
    console.log('$$$ Cache has already been fetched');
  }
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
function getAll(){
  let requestTime = Date.now();
  repoState = RepoStates.SYNCHRONIZING;

  let origRepoTreeHashes = TreeConfiguration.getWorkingTree().getAllTreeHashes();
  let thTime = Date.now();
  console.log('$$$ Get Tree Hash Time: ' + (thTime - requestTime)/1000);

  socket.emit('Item/getAll', {repoTreeHashes: origRepoTreeHashes},
    (response) => {
      var responseReceiptTime = Date.now();
      console.log('::: Response for getAll took ' + (responseReceiptTime-requestTime)/1000);

      // Update local ItemProxy
      processBulkUpdate(response);
      let bulkUpdateTime = Date.now();
      console.log('$$$ Bulk update took: ' + (bulkUpdateTime-responseReceiptTime)/1000);
      ItemProxy.getWorkingTree().loadingComplete();
      let loadingComplete = Date.now();
      console.log('$$$ Load Complete took: ' + (loadingComplete - bulkUpdateTime)/1000);
      let processingCompleteTime = Date.now();
      console.log('::: Processing completed at ' + (processingCompleteTime-responseReceiptTime)/1000);

      // TODO need to remove this storage of allItems response
      serverCache.allItems = response;

      syncCompleted();
    }
  );
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function syncWithServer(callback){
  console.log('$$$ Sync with server');

  if (serverCache.allItems) {
    callback(serverCache);
    return;
  }

  // Sync with server is pending/required
  if(callback){
    repoSyncCallback.push(callback);
  }

  switch (repoState){
    case RepoStates.DISCONNECTED:
    case RepoStates.SYNCHRONIZATION_FAILED:
      console.log('::: Requesting Sync');
      getMetamodel();
      break;
    case RepoStates.SYNCHRONIZING:
      console.log('::: Already Syncronizing');
      break;
    case RepoStates.SYNCHRONIZATION_SUCCEEDED:
      console.log('??? Sync Succeeded');
  }
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function syncCompleted(){
  repoState = RepoStates.SYNCHRONIZATION_SUCCEEDED;

  // Deliver sync results to all pending clients
  for(let cbIdx in repoSyncCallback){
    let callback = repoSyncCallback[cbIdx];
    callback(serverCache);
  }
  repoSyncCallback = [];
}
