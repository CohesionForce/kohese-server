'use strict';

export class CacheManager {

  constructor() {
    throw 'Invalid_Class';
  }

  static nextRequestId : number = 0;

  static callbackMap = {};

  static objectMap = {};

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static authenticate() {
    console.log('$$$ authenticating');
    cacheWorker.port.postMessage({type: 'processAuthToken', authToken: localStorage.getItem('auth-token')});
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static sync(callback) {
    console.log('$$$ requesting sync');

    let requestId;
    if (callback){
      requestId = this.nextRequestId++;
      this.callbackMap[requestId] = callback;
    }
    this.callbackMap['bulkCacheUpdate'] = this.processBulkCacheUpdate;
    cacheWorker.port.postMessage({type: 'sync', requestId: requestId});
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static processBulkCacheUpdate(bulkUpdate){

    for (let key in bulkUpdate){
      console.log("::: Received BulkCacheUpdate for: " + key);
      if(!this.objectMap[key]){
        this.objectMap[key] = {};
      }
      Object.assign(this.objectMap[key], bulkUpdate[key]);
    }

  }
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
let scripts = document.scripts;
let cacheWorkerBundle;
for (let scriptIdx in scripts){
  let script = scripts[scriptIdx];
  if(script.attributes){
    for(let idx in script.attributes){
      let attribute = script.attributes[idx];
      if (attribute.value){
        if(attribute.value.match(/^cache-worker/)){
          cacheWorkerBundle = attribute.value;
        }

      }
    }
  }
}
console.log('::: Using cache worker bundle: ' + cacheWorkerBundle);
let cacheWorker : SharedWorker.SharedWorker = new SharedWorker(cacheWorkerBundle);

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
cacheWorker.port.onmessage = function (event){
  let message = event.data;

  console.log('::: Message received from cache worker: ' + message.type);

  switch (message.type){
    case 'newClient':
      console.log('$$$ New client tab connected');
      console.log(message);
      break;
    case 'bulkCacheUpdate':
      console.log('$$$ bCU');
      CacheManager.processBulkCacheUpdate(message.chunk);
      break;
  }

  if (message.hasOwnProperty('requestId')){
    let callback = CacheManager.callbackMap[message.requestId];
    if (callback){
      console.log('::: Invoking callback');
      delete CacheManager.callbackMap[message.requestId];
      let response = message.response;
      if (message.type === 'sync'){
        response.objectMap = CacheManager.objectMap;
      }
      callback(response);
    }
  }

}
