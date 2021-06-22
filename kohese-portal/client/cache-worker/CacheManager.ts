/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


'use strict';
import { Injectable } from '@angular/core';


export type CallbackFunctionType = (messageData: any) => void;

type CallbackMapType = {
  [id:string] : Array<CallbackFunctionType>;
};

type ResolveFunctionType = (data: any) => void;

type PendingRequestType = {
  requestId : number;
  message : string;
  requestData : any;
  requestTime: number;
  resolve: ResolveFunctionType
};

type PendingRequestsMapType = {
  [id:string] : PendingRequestType;
};

@Injectable()
export class CacheManager {

  private static cacheWorker: SharedWorker.SharedWorker;

  private static callbackMap : CallbackMapType = {};
  private static pendingRequestMap : PendingRequestsMapType = {};

  private static suppressWorkerRequestAnnouncement = {
    connectionVerification: true
  };

  private static suppressWorkerEventAnnouncement = {
    verifyConnection: true
  };

  private static _singleton : CacheManager = new CacheManager();

  //////////////////////////////////////////////////////////////////////////
  constructor() {
    if (!CacheManager._singleton) {
      CacheManager._singleton = this;
      this.initialize();
    }
    return CacheManager._singleton;
  }

  //////////////////////////////////////////////////////////////////////////
  private initialize() {
    // Find the bundle containing the CacheWorker
    console.log('::: Initializing Cache Manager');
    if (CacheManager.cacheWorker) {
      console.log('*** Unexpected attempt to initialize CacheManager');
      return;
    }
    let scripts: any = document.scripts;
    let cacheWorkerBundle: string;
    scriptLoop: for (let scriptIdx in scripts) {
      let script: any = scripts[scriptIdx];
      if (script.attributes) {
        for (let idx in script.attributes) {
          let attribute: any = script.attributes[idx];
          if (attribute.value) {
            if (attribute.value.match(/^scripts/)) {
              cacheWorkerBundle = attribute.value;
              break scriptLoop;
            }
          }
        }
      }
    }

    console.log('::: Using cache worker bundle: ' + cacheWorkerBundle);
    CacheManager.cacheWorker = new SharedWorker(cacheWorkerBundle);

    // Set up the worker messaging
    CacheManager.cacheWorker.port.addEventListener('message', (messageEvent: any) => {

      let msg: any = messageEvent.data;

      if (!msg.message){
        // Message does not have a message field, so it should be a request response

        if (msg.id) {
          let pendingRequest = CacheManager.pendingRequestMap[msg.id];
          if (pendingRequest) {
            let responseTime = Date.now();
            console.log('^^^ Received response from worker for request: ' + pendingRequest.message + ' - ' + msg.id + ' - ' +
              (responseTime-pendingRequest.requestTime)/1000);
            pendingRequest.resolve(msg.data);
            delete CacheManager.pendingRequestMap[msg.id];
          } else {
            console.log('*** Received unexpected response message for id: ' + msg.id);
            console.log(messageEvent);
          }

          // Ignore response that is directed to another event listener
          // console.log('^^^ Received response from worker in main listener for request: ' + msg.id);
        } else {
          console.log('*** Received malformed response message');
          console.log(messageEvent);
        }
      } else {
        // Received an unsolicited message (not a request response)

        let beforeProcessing = Date.now();
        if (!CacheManager.suppressWorkerEventAnnouncement[msg.message]){
          console.log('^^^ Received message from worker: ' + msg.message);
        }

        let callbackMapEntry : Array<CallbackFunctionType> = CacheManager.callbackMap[msg.message];
        if (callbackMapEntry) {
          // Deliver message data to all subscribers
          for (let index in callbackMapEntry) {
            let callback = callbackMapEntry[index];
            try {
              callback(msg.data);
            } catch (err) {
              console.log('*** Error' + err);
              console.log(err.stack);
            }
          }
        } else {
          console.log('*** Received unexpected message: ' + msg.message);
          console.log(msg.data);
        }

        if (!CacheManager.suppressWorkerEventAnnouncement[msg.message]){
          let afterProcessing = Date.now();
          console.log('^^^ Processed message from worker ' + msg.message + ' - '
            + (afterProcessing - beforeProcessing) / 1000);
        }
      }

      //

    });

    CacheManager.cacheWorker.port.start();
  }

  //////////////////////////////////////////////////////////////////////////
  subscribe(message: string, callback : CallbackFunctionType) {
    if (!CacheManager.callbackMap[message]) {
      // Create the first callback entry
      CacheManager.callbackMap[message] = [ callback ]
    } else {
      // Append to the existing callback entry
      CacheManager.callbackMap[message].push(callback);
    }
  }

  //////////////////////////////////////////////////////////////////////////
  sendMessageToWorker(message: string, data: any, expectResponse: boolean): Promise<any> {

    return new Promise<any>((resolve: (data: any) => void, reject:
      () => void) => {

      let requestTime = Date.now();
      let id: number = requestTime;

      if (!CacheManager.suppressWorkerRequestAnnouncement[message]) {
        console.log('^^^ Send message to worker: ' + message + ' - ' + id);
      }

      if (expectResponse) {
        let requestInfo : PendingRequestType = {
          requestId: id,
          message: message,
          requestData: data,
          requestTime: requestTime,
          resolve: resolve
        };

        CacheManager.pendingRequestMap[id] = requestInfo;
      }

      CacheManager.cacheWorker.port.postMessage({
        type: message,
        id: id,
        data: data
      });

      if (!expectResponse) {
        // No response expected, so immediately resolve
        resolve(undefined);
      }
    });
  }

}
