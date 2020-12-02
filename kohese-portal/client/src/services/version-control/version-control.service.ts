import { Injectable } from '@angular/core';

import { ItemProxy } from '../../../../common/src/item-proxy';
import { Observable, from } from 'rxjs';
import { CacheManager } from '../../../cache-worker/CacheManager';


@Injectable()
export class VersionControlService {

  public constructor(private CacheManager: CacheManager) {
  }

  public stageItems(proxies: Array<ItemProxy>): Observable<any> {
    let data: {
      proxyIds: Array<string>;
    } = {
      proxyIds: []
    };
    for (let j = 0; j < proxies.length; j++) {
      data.proxyIds.push(proxies[j].item.id);
    }

    return from(this.CacheManager.sendMessageToWorker('VersionControl/stage', data, true));
  }

  public unstageItems(proxies: Array<ItemProxy>): Observable<any> {
    let data: {
      proxyIds: Array<string>;
    } = {
      proxyIds: []
    };
    for (let j = 0; j < proxies.length; j++) {
      data.proxyIds.push(proxies[j].item.id);
    }

    return from(this.CacheManager.sendMessageToWorker('VersionControl/unstage', data, true));
  }

  public revertItems(proxies: Array<ItemProxy>): Observable<any> {
    let data: {
      proxyIds: Array<string>;
    } = {
      proxyIds: []
    };
    for (let j = 0; j < proxies.length; j++) {
      data.proxyIds.push(proxies[j].item.id);
    }

    return from(this.CacheManager.sendMessageToWorker('VersionControl/revert', data, true));
  }

  public commitItems(proxies: Array<ItemProxy>, committer: any,
    commitMessage: string): Observable<any> {
    let data: {
      proxyIds: Array<string>;
      username: string;
      email: string;
      message: string;
    } = {
      proxyIds: [],
      username: committer.name,
      email: committer.email,
      message: commitMessage
    };
    for (let j = 0; j < proxies.length; j++) {
      data.proxyIds.push(proxies[j].item.id);
    }

    return from(this.CacheManager.sendMessageToWorker('VersionControl/commit', data, true));
  }

  public push(ids: string[], remoteName: string): Observable<any> {
    let data: {
      proxyIds: Array<string>;
      remoteName: string;
    } = {
      proxyIds: ids,
      remoteName: remoteName
    };

    return from(this.CacheManager.sendMessageToWorker('VersionControl/push', data, true));
  }

  public addRemote(id: string, remoteName: string, url: string): Observable<any> {
    let data: {
      proxyId: string;
      remoteName: string;
      url: string;
    } = {
      proxyId: id,
      remoteName: remoteName,
      url: url
    };

    return from(this.CacheManager.sendMessageToWorker('VersionControl/addRemote', data, true));
  }

  getRemotes(id: string): Observable<any> {
    let data: {
      proxyId: string;
    } = {
      proxyId: id
    };

    return from(this.CacheManager.sendMessageToWorker('VersionControl/getRemotes', data, true));
  }
}
