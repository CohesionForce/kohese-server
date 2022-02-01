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


// Angular
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';

// Other External Imports

// Kohese
import { CurrentUserService } from './current-user.service';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { ItemRepository, RepoStates } from '../item-repository/item-repository.service';
import { CacheManager } from '../../../cache-worker/CacheManager';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';

@Injectable()
export class SessionService {
  private _user: any;
  get user() {
    return this._user;
  }


  // <itemProxy.item.id, itemProxy>
  private _userProxies: Map<string,ItemProxy> = new Map<string,ItemProxy>();
  get userProxies() {
    let sortedUsers: Array<ItemProxy> = Array.from(this._userProxies.values());

    // gives alphabetically sorted list of proxies
    sortedUsers.sort((leftUserProxy: any, rightUserProxy: any) => {
      return leftUserProxy.item.name.localeCompare(rightUserProxy.item.name);
    });

    return sortedUsers;
  }

  private _sessionMap: {};
  get sessionMap() {
    return this._sessionMap;
  }

  sessionChangeSubject: Subject<any> = new Subject<any>();
  usersChangeSubject: Subject<ItemProxy[]> = new Subject<ItemProxy[]>();
  private treeConfigChangeSubjectSub: Subscription;
  private repositoryStatusSubscription: Subscription;

  public constructor(private CurrentUserService: CurrentUserService,
                     private cacheManager : CacheManager,
                     private itemRepository: ItemRepository,
                     private router: Router
  ) {
    this.CurrentUserService.getCurrentUserSubject().subscribe( async (decodedToken: any) => {
      if (decodedToken) {

        this.repositoryStatusSubscription = this.itemRepository.getRepoStatusSubject().subscribe(async (status: any) => {
          if (RepoStates.SYNCHRONIZATION_SUCCEEDED === status.state) {
            this._userProxies.clear();

            let rootProxy = TreeConfiguration.getWorkingTree().getRootProxy();
            this._user = rootProxy.getChildByName('Users').getChildByName(decodedToken.username).item;

            rootProxy.visitChildren({ includeOrigin: false }, (itemProxy: ItemProxy) => {
              if (itemProxy.kind === 'KoheseUser') {
                this._userProxies.set(itemProxy.item.id, itemProxy);
              }
            });
            // sends sorted users list
            this.usersChangeSubject.next(this.userProxies);
            this._sessionMap = await this.cacheManager.sendMessageToWorker('getSessionMap', undefined, true);

            if(this.treeConfigChangeSubjectSub) {
              this.treeConfigChangeSubjectSub.unsubscribe();
            }

            this.treeConfigChangeSubjectSub = TreeConfiguration.getWorkingTree().getChangeSubject().subscribe((change) => {
              if(change.proxy.kind === 'KoheseUser') {
                switch (change.type) {
                  case 'create':
                  case 'update':
                    this._userProxies.set(change.proxy.item.id, change.proxy);
                    this.usersChangeSubject.next(this.userProxies);
                    break;
                  case 'delete':
                    this._userProxies.delete(change.proxy.item.id);
                    this.usersChangeSubject.next(this.userProxies);
                    break;
                  default:
                    break;
                }
              }
            });
          }
        });

        this.cacheManager.subscribe('sessionAdd', (sessionData) => {
          this._sessionMap[sessionData.sessionId] = sessionData;
          this.sessionChangeSubject.next({
            type: 'add',
            sessionData: this._sessionMap[sessionData.sessionId]
          });
        });

        this.cacheManager.subscribe('sessionUpdate', (sessionData) => {
          this._sessionMap[sessionData.sessionId].numberOfConnections = sessionData.numberOfConnections;
          this.sessionChangeSubject.next({
            type: 'update',
            sessionData: this._sessionMap[sessionData.sessionId]
          });
        });

        this.cacheManager.subscribe('sessionDelete', (sessionData) => {
          let oldSessionData = this._sessionMap[sessionData.sessionId];
          delete this._sessionMap[sessionData.sessionId];
          this.sessionChangeSubject.next({
            type: 'delete',
            sessionData: oldSessionData
          });
        });

      } else {
        if (this.repositoryStatusSubscription) {
          this.repositoryStatusSubscription.unsubscribe();
        }
        this._user = undefined;
        this._userProxies = undefined;
        this._sessionMap = undefined;

        this.router.navigate(['login']);
      }
    });
  }

}
