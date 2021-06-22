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
import { CacheManager } from '../../../cache-worker/CacheManager';

@Injectable()
export class RepositoryService {

  constructor(private CacheManager: CacheManager) {}

    public async getAvailableRepositories(): Promise<any> {
      return (await this.CacheManager.sendMessageToWorker('Repository/getAvailableRepositories', {}, true));
    }

    public async unMountRepository(id: string): Promise<any> {
      console.log('^^^ unMount Repository in repoService ', id)
      return (await this.CacheManager.sendMessageToWorker('Repository/unMountRepository', {id}, true));
    }

    public async disableRepository(id: string): Promise<any> {
      console.log('^^^ disableRepository in repoService ', id)
      return (await this.CacheManager.sendMessageToWorker('Repository/disableRepository', {id}, true));
    }

    public async getDisabledRepositories(): Promise<any> {
      return (await this.CacheManager.sendMessageToWorker('Repository/getDisabledRepositories', {}, true));
    }

    public async enableRepository(id: string): Promise<any> {
      return (await this.CacheManager.sendMessageToWorker('Repository/enableRepository', {id}, true));
    }

    public async mountRepository(proxy): Promise<void> {
      return (await this.CacheManager.sendMessageToWorker('Repository/mountRepository', {
          kind: proxy.kind,
          id: proxy.id}, true));
    }

    public async addRepository(id: string, parentId: string, timestamp: number, username: string): Promise<any> {
      return (await this.CacheManager.sendMessageToWorker('Repository/addRepository', {id, parentId, timestamp, username}, true));
    }

    /* mountRepository = function (mountTarget, mountData, callback) {
      var data = {
        mountTarget : mountTarget,
        mountData : mountData
      }
      KoheseIO.socket.emit('Mount/mountRepository', data, function (results) {
        console.log('Mount Repository Called');
        service.enableMount(mountTarget, mountData, () => {});
        callback();
      });
    }

    service.dismountRepository = function (mountTarget, mountData, callback) {
      service.disableMount(mountTarget, mountData, () => {
        var data = {
          mountTarget : mountTarget,
          mountData : mountData
        }
        KoheseIO.socket.emit('Mount/unmountRepository', data, function (results) {
          console.log('Dismount Repository Called');
          console.log(results);
          callback();
        });
      });
    }

    service.disableMount = function (mountTarget, mountData, callback) {
      var data = {
        mountTarget : mountTarget,
        mountData : mountData
      };
      KoheseIO.socket.emit('Mount/disableMount', data, function (results) {
        console.log('Disable Mount Called');
        console.log(results);
        callback();
      });
    }

    service.enableMount = function (mountTarget, mountData, callback) {
      var data = {
        mountTarget : mountTarget,
        mountData : mountData
      };
      KoheseIO.socket.emit('Mount/enableMount', data, function (results) {
        console.log('Enable Mount Called');
        console.log(results);
        callback();
      });
    }

    service.getRepositories = function (callback) {
      var data = {
      }
      KoheseIO.socket.emit('Mount/getRepositories', data, function (results) {
        console.log('Get Repository Called')
        console.log(results);
        callback(results);
      });
    }

    service.ignoreError = function (repositoryId, errorString, path, callback) {
      var data = {
        id : repositoryId,
        errorCode : errorString,
        path : path
      }
      KoheseIO.socket.emit('Mount/ignoreError', data, () => {
        callback();
      })
    }

    service.unignoreError = function (repositoryId, errorString, path, callback) {
      var data = {
        id : repositoryId,
        errorCode : errorString,
        path : path
      }
      KoheseIO.socket.emit('Mount/ignoreError', data, () => {
        callback();
      })
    } */
}
