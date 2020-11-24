'use strict';

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


  //////////////////////////////////////////////////////////////////////////
  constructor() {
    throw 'Can-Not-Create-Instance';
  }

  //////////////////////////////////////////////////////////////////////////
  static initialize() {
    // Find the bundle containing the CacheWorker
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
    this.cacheWorker = new SharedWorker(cacheWorkerBundle);

    // Set up the worker messaging
    this.cacheWorker.port.addEventListener('message', (messageEvent: any) => {

      let msg: any = messageEvent.data;

      if (!msg.message){
        // Message does not have a message field, so it should be a request response

        if (msg.id) {
          let pendingRequest = this.pendingRequestMap[msg.id];
          if (pendingRequest) {
            let responseTime = Date.now();
            console.log('^^^ Received response from worker for request: ' + pendingRequest.message + ' - ' + msg.id + ' - ' +
              (responseTime-pendingRequest.requestTime)/1000);
            pendingRequest.resolve(msg.data);
            delete this.pendingRequestMap[msg.id];
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
        if (!this.suppressWorkerEventAnnouncement[msg.message]){
          console.log('^^^ Received message from worker: ' + msg.message);
        }

        let callbackMapEntry : Array<CallbackFunctionType> = this.callbackMap[msg.message];
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

        if (!this.suppressWorkerEventAnnouncement[msg.message]){
          let afterProcessing = Date.now();
          console.log('^^^ Processed message from worker ' + msg.message + ' - '
            + (afterProcessing - beforeProcessing) / 1000);
        }
      }

      //

    });

    this.cacheWorker.port.start();
  }

  //////////////////////////////////////////////////////////////////////////
  static subscribe(message: string, callback : CallbackFunctionType) {
    if (!this.callbackMap[message]) {
      // Create the first callback entry
      this.callbackMap[message] = [ callback ]
    } else {
      // Append to the existing callback entry
      this.callbackMap[message].push(callback);
    }
  }

  //////////////////////////////////////////////////////////////////////////
  static sendMessageToWorker(message: string, data: any, expectResponse: boolean): Promise<any> {

    return new Promise<any>((resolve: (data: any) => void, reject:
      () => void) => {

      let requestTime = Date.now();
      let id: number = requestTime;

      if (!this.suppressWorkerRequestAnnouncement[message]) {
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

        this.pendingRequestMap[id] = requestInfo;
      }

      this.cacheWorker.port.postMessage({
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

// Initialize the CacheManager class
CacheManager.initialize();
