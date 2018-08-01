console.log('$$$ Loading Cache Worker');

import * as SocketIoClient from 'socket.io-client';
import { ItemProxy } from '../../common/src/item-proxy';
import { TreeConfiguration } from '../../common/src/tree-configuration';
import { ItemCache } from '../../common/src/item-cache';
import { KoheseModel } from '../../common/src/KoheseModel';

let socket : SocketIOClient.Socket = SocketIoClient();
let serverCache = {
  metaModel: undefined,
  allItems: undefined
}
let objectMap : any = {};
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
(<any>self).onconnect = (connectEvent) => {
  var port = connectEvent.ports[0];

  console.log('::: Received new connection');
  console.log(connectEvent);

  let clientId = Date.now();

  // Notify all client tabs that a new client connected
  postMessageToAllClients({type: 'newClient', clientId: clientId});

  clientMap[clientId] = port;

  console.log('$$$ Client List:');
  console.log(clientMap);

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  port.onmessage = function(event) {
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
            function sendBulkCacheUpdate(key, value){
              let bulkUpdateMessage = {};
              bulkUpdateMessage[key] = value;
              port.postMessage({type: 'bulkCacheUpdate', chunk: bulkUpdateMessage});
            }

            // Send Cache Chunks
            sendBulkCacheUpdate('metadata', objectMap['metadata']);
            sendBulkCacheUpdate('refs', objectMap['refs']);
            sendBulkCacheUpdate('tags', objectMap['tags']);
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
function getItemCache(){
  if (!cacheFetched){
    console.log('$$$ Get Item Cache');
    let requestTime = Date.now();

    socket.emit('Item/getItemCache', {
      timestamp: {
        requestTime: requestTime
      }
    },
    (response) => {
      var responseReceiptTime = Date.now();
      let timestamp = response.timestamp;
      timestamp.responseReceiptTime = responseReceiptTime;
      console.log(timestamp);
      console.log('::: Response for getItemCache');
      for(let tsKey in timestamp){
        console.log('$$$ ' + tsKey + ': ' + (timestamp[tsKey]-requestTime));
      }
      console.log(Object.keys(objectMap));
      let itemCache = new ItemCache();
      itemCache.setObjectMap(objectMap);
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

      // Transfer the Cache while waiting for response
      objectMap = itemCache.getObjectMap();
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
    if(!objectMap[key]){
      objectMap[key] = {};
    }
    Object.assign(objectMap[key], bulkUpdate[key]);
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

  // Determine if repo is already synched
  if (objectMap && serverCache.allItems){
    console.log('$$$ syncWithServer: Sending cached items');
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
