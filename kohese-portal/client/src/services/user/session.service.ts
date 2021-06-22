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
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';
import { CurrentUserService } from './current-user.service';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { ItemRepository } from '../item-repository/item-repository.service';

@Injectable()
export class SessionService {
  private _user: any;
  get user() {
    return this._user;
  }

  private _users: Array<any> = [];
  get users() {
    return this._users;
  }

  private _treeConfigurationSubscription: Subscription;

  public constructor(private CurrentUserService: CurrentUserService,
    private itemRepository: ItemRepository, private router: Router) {
    this.CurrentUserService.getCurrentUserSubject().subscribe((decodedToken:
      any) => {
      if (decodedToken) {
        this._treeConfigurationSubscription = this.itemRepository.
          getTreeConfig().subscribe((treeConfigurationObject: any) => {
          this._users = [];
          if (treeConfigurationObject) {
            this._user = treeConfigurationObject.config.getRootProxy().
              getChildByName('Users').getChildByName(decodedToken.username).
              item;

            treeConfigurationObject.config.getRootProxy().visitChildren(
              { includeOrigin: false }, (itemProxy: ItemProxy) => {
              if (itemProxy.kind === 'KoheseUser') {
                this._users.push(itemProxy.item);
              }
            });

            this._users.sort((oneUser: any, anotherUser: any) => {
              return oneUser.name.localeCompare(anotherUser.name);
            });
          }
        });
      } else {
        if (this._treeConfigurationSubscription) {
          this._treeConfigurationSubscription.unsubscribe();
        }

        this.router.navigate(['login']);
      }
    });
  }
}
