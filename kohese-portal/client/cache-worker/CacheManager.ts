'use strict';

export class CacheManager {

  constructor() {
    throw 'Invalid_Class';
  }

  static nextRequestId : number = 0;

  static callbackMap = {};

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
  static getAllItems(callback) {
    console.log('$$$ requesting getAllItems');

    let requestId;
    if (callback){
      requestId = this.nextRequestId++;
      this.callbackMap[requestId] = callback;
    }
    cacheWorker.port.postMessage({type: 'getAllItems', requestId: requestId});
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

  if (message.hasOwnProperty('requestId')){
    let callback = CacheManager.callbackMap[message.requestId];
    if (callback){
      console.log('::: Invoking callback');
      delete CacheManager.callbackMap[message.requestId];
      callback(message.response);
    }
  }

  switch (message.type){
    case 'newClient':
      console.log('$$$ New client tab connected');
      console.log(message);

  }
}
