import { ItemCache, KoheseCommit } from './item-cache';

import * as LevelUp_Import from 'levelup';
import * as SubLevelDown_Import from 'subleveldown';

//
// Adjust for the differences in CommonJS and ES6
//
let LevelUp;
if (typeof(LevelUp_Import) === 'object') {
  LevelUp = (<any>LevelUp_Import).default;
} else {
  LevelUp = LevelUp_Import;
}

//
// Adjust for the differences in CommonJS and ES6
//
let SubLevelDown;
if (typeof(SubLevelDown_Import) === 'object') {
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
type GetValueMethod = (this : ItemCache, key:string) => Promise<any>;

interface SublevelRegistration {
  sublevelName : string,
  sublevel : any,
  getMapMethod : GetMapMethod,
  setValueMethod: SetValueMethod,
  getValueMethod: GetValueMethod
}

export class LevelCache extends ItemCache {

  private cacheDB;
  private registrationMap: Map<string, SublevelRegistration> = new Map<string, SublevelRegistration>();
  private pendingWrite = {};

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  constructor(levelDown) {
    super();

    this.cacheDB = LevelUp(levelDown);

    this.registerSublevel(
      'metadata',
      this.getAllMetaData,
      super.cacheMetaData,
      this.getMetaData,
    );

    this.registerSublevel(
      'ref',
      this.getRefs,
      super.cacheRef,
      this.getRef,
    );

    this.registerSublevel(
      'tag',
      this.getTags,
      super.cacheTag,
      this.getTag
    );

    this.registerSublevel(
      'kCommit',
      this.getCommits,
      super.cacheCommit,
      this.getCommit
    );


    this.registerSublevel(
      'workspace',
      this.getWorkspaces,
      super.cacheWorkspace,
      this.getWorkspace
    );

    this.registerSublevel(
      'kTree',
      this.getTrees,
      super.cacheTree,
      this.getTree
    );

    this.registerSublevel(
      'blob',
      this.getBlobs,
      super.cacheBlob,
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

    this.pendingWrite[sublevelName] = [];
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async retrieveValue (sublevelName, key) : Promise<any> {
    let registration : SublevelRegistration = this.registrationMap.get(sublevelName);
    if(!sublevelName){
      console.log('*** Invalid sublevel map Lookup: ' + sublevelName + ' - ' + key);
    }
    let value = await super.retrieveValue(sublevelName, key);

    if (key === undefined){
      console.log('@@@ Map Lookup: ' + sublevelName + ' - ' + key );
    }

    if (value !== undefined) {
      return Promise.resolve(value);
    } else {
      let levelPromise = registration.sublevel.get(key)

      let result = new Promise((resolve) => {

        levelPromise.then((dbValue) => {
          registration.setValueMethod.call(this, key, dbValue);
          resolve(dbValue);
        }).catch((err) => {
          resolve(undefined);
        });
      });

      await result;

      return result;

    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cacheKeyValuePair(sublevelName, key, value, alreadyCached: boolean = false) {
    let registration = this.registrationMap.get(sublevelName);
    if (registration) {
      //  console.log('$$$ Set Value for: ' + sublevelName + ' - ' + key + ' - ' + alreadyCached);
      registration.setValueMethod.call(this, key, value);
      if (!alreadyCached){
        this.pendingWrite[sublevelName].push({
          type: 'put',
          key: key,
          value: value
        });
      }

    } else {
      console.log('*** Sublevel Registration not found for: ' + sublevelName);
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cacheMetaData(key, value){
    this.cacheKeyValuePair('metadata', key, value);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cacheRef(ref, oid){
    this.cacheKeyValuePair('ref', ref, oid);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cacheTag(tag, oid){
    this.cacheKeyValuePair('tag', tag, oid);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cacheCommit(oid : string, commit : KoheseCommit){
    this.cacheKeyValuePair('kCommit', oid, commit);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cacheTree(oid, tree){
    this.cacheKeyValuePair('kTree', oid, tree);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cacheBlob(oid, blob){
    this.cacheKeyValuePair('blob', oid, blob);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cacheWorkspace(name, workspace){
    this.cacheKeyValuePair('workspace', name, workspace);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async loadCachedObjects() {

    let beforeLoadCache = Date.now();
    const isAlreadyCached = true;

    let sublevelNames = Array.from(this.registrationMap.keys());
    for (let sublevelName of sublevelNames){
      let beforeSublevel = Date.now();
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
        this.cacheKeyValuePair(sublevelName, entry.key, entry.value, isAlreadyCached);
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
      let afterSublevel = Date.now();
      console.log('::: Loaded cache for sublevel: ' + sublevelName + ' - ' + (afterSublevel-beforeSublevel)/1000);
    }

    let afterLoadCache = Date.now();

    console.log('$$$ Load time from Level Cache: ' + (afterLoadCache - beforeLoadCache)/1000);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async saveSublevel(sublevelName){
    // console.log('::: Saving Sublevel: ' + sublevelName);
    try {
      let registration = this.registrationMap.get(sublevelName);
      let sublevel = registration.sublevel;
      let entries = [...this.pendingWrite[sublevelName]];

      if (entries.length > 0) {
        // Clear the pendingWrite array
        this.pendingWrite[sublevelName] = [];

        console.log('+++ Adding ' + entries.length + ' entries to ' + sublevelName);
        await sublevel.batch(entries);
      }

    } catch (err) {
      console.log('*** Error: ' + err);
      console.log(err.stack);
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async saveAllPendingWrites(){
    console.log('::: Checking for cache data to save');
    let sublevelNames = Array.from(this.registrationMap.keys());
    for (let sublevelName of sublevelNames){
      await this.saveSublevel(sublevelName);
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async processBulkCacheUpdate(bulkUpdate){

    for (let bulkUpdateKey in bulkUpdate){
      console.log('::: Processing BulkCacheUpdate for: ' + bulkUpdateKey);
      let sublevelName = CacheBulkTransferKeyToSublevelMap[bulkUpdateKey];

      for (let key in bulkUpdate[bulkUpdateKey]) {
        let value = bulkUpdate[bulkUpdateKey][key];
        this.cacheKeyValuePair(sublevelName, key, value);
      }

      let sublevel = this.registrationMap.get(sublevelName).sublevel;

      await this.saveSublevel(sublevelName);
    }

  }
}
