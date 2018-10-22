import { ItemProxy } from './item-proxy';
import { TreeConfiguration } from './tree-configuration';
import { ItemCache } from './item-cache';

import * as LevelUp_Import from 'levelup';
import * as SubLevelDown_Import from 'subleveldown';

//
// Adjust for the differences in CommonJS and ES6
//
let LevelUp;
if (typeof(LevelUp_Import) === "object") {
  LevelUp = (<any>LevelUp_Import).default;
} else {
  LevelUp = LevelUp_Import;
}

//
// Adjust for the differences in CommonJS and ES6
//
let SubLevelDown;
if (typeof(SubLevelDown_Import) === "object") {
  SubLevelDown = (<any>SubLevelDown_Import).default;
} else {
  SubLevelDown = SubLevelDown_Import;
}

const CacheBulkTransferKeyToSublevelMap = {
  'metadata': 'metadata',
  'refMap': 'ref',
  'tagMap': 'tag',
  'kCommitMap': 'kCommit',
  'kTreeMap': 'kTree',
  'blobMap': 'blob',
}

type GetMapMethod = (this : ItemCache) => Map<string, any>;
type SetValueMethod = (this : ItemCache, key:string, value: any) => void;
type GetValueMethod = (this : ItemCache, key:string) => any;

type SublevelRegistration = {
  sublevelName : string,
  sublevel : any,
  getMapMethod : GetMapMethod,
  setValueMethod: SetValueMethod,
  getValueMethod: GetValueMethod
};

export class LevelCache extends ItemCache {

  private cacheDB;
  private registrationMap: Map<string, SublevelRegistration> = new Map<string, SublevelRegistration>();

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  constructor(levelDown) {
    super();

    this.cacheDB = LevelUp(levelDown);

    this.registerSublevel(
      'metadata',
      this.getAllMetaData,
      this.cacheMetaData,
      this.getMetaData,
    );

    this.registerSublevel(
      'ref',
      this.getRefs,
      this.cacheRef,
      this.getRef,
    );

    this.registerSublevel(
      'tag',
      this.getTags,
      this.cacheTag,
      this.getTag
    );

    this.registerSublevel(
      'kCommit',
      this.getCommits,
      this.cacheCommit,
      this.getCommit
    );

    this.registerSublevel(
      'kTree',
      this.getTrees,
      this.cacheTree,
      this.getTree
    );

    this.registerSublevel(
      'blob',
      this.getBlobs,
      this.cacheBlob,
      this.getBlob
    );
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  registerSublevel(sublevelName: string, getMapMethod: GetMapMethod,
    cacheMethod: SetValueMethod, getValueMethod: GetValueMethod) {
    console.log('$$$ Registering sublevel: ' + sublevelName);

    let sublevel = SubLevelDown(this.cacheDB, sublevelName, { valueEncoding: 'json' });

    let registration : SublevelRegistration = {
      sublevelName : sublevelName,
      sublevel : sublevel,
      getMapMethod : getMapMethod,
      setValueMethod: cacheMethod,
      getValueMethod: getValueMethod
    };

    this.registrationMap.set(sublevelName, registration);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async retrieveValue (sublevelName, key) : Promise<any> {
    let registration : SublevelRegistration = this.registrationMap.get(sublevelName);
    let value = registration.getValueMethod.call(this, key);
    if (value !== undefined) {
      // console.log('$$$ Returning already loaded value: ' + key);
      return Promise.resolve(value);
    } else {
      // console.log('$$$ Waiting for value to load: ' + key);
      return registration.sublevel.get(key);
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  private cacheKeyValuePair(sublevelName, key, value) {
    let registration = this.registrationMap.get(sublevelName);
    if (registration) {
      // console.log('$$$ Set Value for: ' + sublevelName + ' - ' + key);
      registration.setValueMethod.call(this, key, value);
    } else {
      console.log('*** Sublevel Registration not found for: ' + sublevelName);
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async loadCachedObjects() {

    let beforeLoadCache = Date.now();

    let sublevelNames = Array.from(this.registrationMap.keys());
    for (let sublevelName of sublevelNames){
      console.log('::: Loading cache for sublevel: ' + sublevelName);
      let sublevel = this.registrationMap.get(sublevelName).sublevel;

      let iterator: any = sublevel.iterator();

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
        this.cacheKeyValuePair(sublevelName, entry.key, entry.value);
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
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async saveSublevel(sublevelName){
    console.log('::: Saving Sublevel: ' + sublevelName);
    try {
      let registration = this.registrationMap.get(sublevelName);
      let sublevel = registration.sublevel;
      let map = registration.getMapMethod.call(this);
      let entries = [];

      console.log('::: Creating Batch for Sublevel: ' + sublevelName);
      Object.keys(map).forEach((key) => {
        entries.push({type: 'put', key: key, value: map[key]})
      });

      console.log('$$$ Adding ' + entries.length + ' entries to ' + sublevelName);
      await sublevel.batch(entries);
    } catch (err) {
      console.log('*** Error: ' + err);
      console.log(err.stack);
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  processBulkCacheUpdate(bulkUpdate){

    for (let bulkUpdateKey in bulkUpdate){
      console.log("::: Processing BulkCacheUpdate for: " + bulkUpdateKey);
      let entries: Array<any> = [];
      let sublevelName = CacheBulkTransferKeyToSublevelMap[bulkUpdateKey];

      for (let key in bulkUpdate[bulkUpdateKey]) {
        let value = bulkUpdate[bulkUpdateKey][key];
        entries.push({
          type: 'put',
          key: key,
          value: value
        });
        this.cacheKeyValuePair(sublevelName, key, value);
      }

      let sublevel = this.registrationMap.get(sublevelName).sublevel;

      console.log('$$$ Adding ' + entries.length + ' entries to ' + sublevelName + ' for ' + bulkUpdateKey);
      sublevel.batch(entries);
    }

  }
}
