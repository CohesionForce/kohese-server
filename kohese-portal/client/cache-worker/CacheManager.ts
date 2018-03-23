'use strict';

export class CacheManager {

  constructor() {
    throw 'Invalid_Class';
  }

  static loadCache() {
    cacheWorker.port.postMessage({type: 'processAuthToken', authToken: localStorage.getItem('auth-token')});
  }
}

let cacheWorker : SharedWorker.SharedWorker = new SharedWorker('cache-worker.bundle.js')

