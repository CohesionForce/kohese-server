import { ItemProxy } from './item-proxy';
import { TreeConfiguration } from './tree-configuration';
import { ItemCache } from './item-cache';

import * as LevelUp from 'levelup';
import * as SubLevelDown from 'subleveldown';

export enum CacheSublevel {
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

export class LevelCache extends ItemCache {

  private sublevelMap: Map<string, any> = new Map<string, any>();

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  constructor(levelDown) {
    super();

    let historyDatabase: any = LevelUp(levelDown);
    let historySublevels: Array<string> = Object.keys(CacheSublevel);

    for (let j: number = 0; j < historySublevels.length; j++) {
      this.sublevelMap.set(CacheSublevel[historySublevels[j]], SubLevelDown(
        historyDatabase, CacheSublevel[historySublevels[j]],
        { valueEncoding: 'json' }));
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  public async retrieveValue (sublevelKey : CacheSublevel, key) {
    return await this.sublevelMap.get(sublevelKey).get(key);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  private cacheKeyValuePair(sublevelKey : CacheSublevel, key, value) {
    switch (sublevelKey) {
      case CacheSublevel.METADATA:
        // TODO:  Need to process metadata and compare with loaded content
        console.log('!!! Ignoring MetaData: ' + key + ' = ' + value);
        break;
      case CacheSublevel.REF:
        this.cacheRef(key, value);
        break;
      case CacheSublevel.TAG:
        this.cacheTag(key, value);
        break;
      case CacheSublevel.K_COMMIT:
        this.cacheCommit(key, value);
        break;
      case CacheSublevel.K_TREE:
        this.cacheTree(key, value);
        break;
      case CacheSublevel.BLOB:
        this.cacheBlob(key, value);
        break;
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async loadCachedObjects() {

    let beforeLoadCache = Date.now();

    let historySublevels: Array<string> = Object.keys(CacheSublevel);

    for (let j: number = 0; j < historySublevels.length; j++) {
      let iterator: any = this.sublevelMap.get(CacheSublevel[
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
        let sublevelKey = CacheSublevel[historySublevels[j]];
        this.cacheKeyValuePair(sublevelKey,entry.key, entry.value);
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
  processBulkCacheUpdate(bulkUpdate){

    for (let bulkUpdateKey in bulkUpdate){
      console.log("::: Processing BulkCacheUpdate for: " + bulkUpdateKey);
      let entries: Array<any> = [];
      let sublevelKey : CacheSublevel = CacheBulkTransferKeyToSublevelMap[bulkUpdateKey];

      for (let key in bulkUpdate[bulkUpdateKey]) {
        let value = bulkUpdate[bulkUpdateKey][key];
        entries.push({
          type: 'put',
          key: key,
          value: value
        });
        this.cacheKeyValuePair(sublevelKey, key, value);
      }

      let sublevel = this.sublevelMap.get(sublevelKey);

      console.log('$$$ Adding ' + entries.length + ' entries to ' + sublevelKey + ' for ' + bulkUpdateKey);
      sublevel.batch(entries);
    }

  }
}
