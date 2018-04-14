console.log('$$$ Loading Cache Worker');

import * as SocketIoClient from 'socket.io-client';
import * as ItemProxy from '../../common/src/item-proxy.js';
import * as ItemCache from '../../common/src/item-cache.js';
import * as KoheseModel from '../../common/src/KoheseModel.js';

let socket : SocketIOClient.Socket = SocketIoClient();
let serverCache = {
  allItems: null,
  objectMap: null
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
      case 'getAllItems':
      console.log('$$$ getAllItems');
      fetchAllItems(
        (response) => {
            port.postMessage({type: 'getAllItems', requestId: request.requestId, response: response});
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
      console.log('::: IR: Socket IO Connection Error');
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
function fetchItemCache(){
  if (!cacheFetched){
    console.log('$$$ Fetch Item Cache');
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
      console.log(Object.keys(response.objectMap));
      serverCache.objectMap = response.objectMap;
      let itemCache = new ItemCache();
      itemCache.setObjectMap(response.objectMap)
      ItemProxy.getWorkingTree().getRootProxy().cache = itemCache;
      cacheFetched = true;

      repoState = RepoStates.SYNCHRONIZATION_SUCCEEDED;

      // Deliver sync results to all pending clients
      for(let cbIdx in repoSyncCallback){
        let callback = repoSyncCallback[cbIdx];
        callback(serverCache);
      }
      repoSyncCallback = [];
    });
  } else {
    console.log('$$$ Cache has already been fetched');
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
function syncWithServer(){
  let requestTime = Date.now();
  repoState = RepoStates.SYNCHRONIZING;

  socket.emit('Item/getAll', {repoTreeHashes: {}},
    (response) => {
      var responseReceiptTime = Date.now();
      console.log('::: Response for getAll took ' + (responseReceiptTime-requestTime)/1000);

      // Update local ItemProxy
      processBulkUpdate(response);
      ItemProxy.getWorkingTree().loadingComplete();
      let processingCompleteTime = Date.now();
      console.log('::: Processing completed at ' + (processingCompleteTime-responseReceiptTime)/1000);

      // TODO need to remove this storage of allItems response
      serverCache.allItems = response;

      fetchItemCache();

    }
  );
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function fetchAllItems(callback){
  console.log('$$$ Fetch All Items');

  // Determine if repo is already synched
  if (serverCache.allItems){
    console.log('$$$ getAll: Sending cached items');
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
      syncWithServer();
      break;
    case RepoStates.SYNCHRONIZING:
      console.log('::: Already Syncronizing');
      break;
    case RepoStates.SYNCHRONIZATION_SUCCEEDED:
      console.log('??? Sync Succeeded');
  }

}
