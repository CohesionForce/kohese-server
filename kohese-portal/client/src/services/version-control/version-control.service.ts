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
