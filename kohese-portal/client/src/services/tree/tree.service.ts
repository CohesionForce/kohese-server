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
import { BehaviorSubject } from 'rxjs';

// Other External Dependencies

// Kohese
import { ItemProxy } from '../../../../common/src/item-proxy';
import { LogService } from '../log/log.service';

@Injectable({
  providedIn: 'root'
})
export class TreeService {

  constructor(
              private logService: LogService,
  ) {}

  recentProxies: Array<ItemProxy> = [];
  logEvents: any;

  _favorites: Array<any> = [];
  get favorites() {
    return this._favorites;
  }
  set favorites(value: any) {
    this._favorites = value;
  }

  _viewingProxyStream : BehaviorSubject<ItemProxy> = new BehaviorSubject<ItemProxy>(null);
  get viewingProxyStream() {
    return this._viewingProxyStream;
  }
  set viewingProxyStream(proxy: any) {
    this._viewingProxyStream.next(proxy);
  }

  _minimize: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  get minimize() {
    return this._minimize;
  }
  set minimize(toggle: any) {
    this._minimize.next(toggle);
  }

  ngOnInit() {
    // TODO: Add check for favorites in local storage

    ItemProxy.getWorkingTree().getChangeSubject().subscribe(change => {
      this.logService.log(this.logEvents.receivedNofificationOfChange, { change: change });

      switch (change.type) {
        case 'loaded':
          this.logService.log(this.logEvents.itemProxyLoaded);
          break;
        case 'loading':
          this.logService.log(this.logEvents.itemProxyLoading);
          break;
        //////////////////////////////////////////////////////////////////////////
        // This case prevents a previously focused item from showing a
        // blank entry in the list of recent proxies once it has been deleted.
        //////////////////////////////////////////////////////////////////////////
        case 'delete':
          let deletedItemIndex = this.recentProxies.findIndex(y => y.item.id === change.proxy.item.id);
          if(deletedItemIndex !== -1) {
            this.recentProxies.splice(deletedItemIndex, 1);
          }
          break;
      }
    });

    this.recentProxies = [];
  }

  //////////////////////////////////////////////////////////////////////////
  registerRecentProxy(itemProxy: ItemProxy) {
    let recentProxyIndex: number = this.recentProxies.indexOf(itemProxy);
    if (recentProxyIndex !== -1) {
      this.recentProxies.splice(recentProxyIndex, 1);
    }

    // Add the recent proxy to the front of list
    this.recentProxies.unshift(itemProxy);
  }

  //////////////////////////////////////////////////////////////////////////
  getRecentProxies(): Array<ItemProxy> {
    return this.recentProxies;
  }

  //////////////////////////////////////////////////////////////////////////
  getFavorites(): Array<any> {
    // TODO: Implementation of favorites retrieval from localStorage
    return this.favorites;
  }

  //////////////////////////////////////////////////////////////////////////
  addFavorite(element: any): Array<any> {
    try {
      let id = element.item.id;
      let favoritesElementIndex = this.favorites.findIndex(t => t.item.id === id);
      if(favoritesElementIndex === -1) {
        this.favorites.unshift(element);
      }
    } catch (error) {
      console.log('!!! Add Favorite Error: %s', error);
    }

    return this.favorites;
  }

  //////////////////////////////////////////////////////////////////////////
  removeFavorite(element: any): Array<any> {
    let id = element.item.id;
    try {
      let favoritesElementIndex = this.favorites.findIndex(t => t.item.id === id);
      if(favoritesElementIndex !== -1) {
        this.favorites.splice(favoritesElementIndex, 1);
      }

    } catch (error) {
      console.log('!!! Remove from Favorites Error: %s', error);
    }
    return this.favorites;
  }
}
