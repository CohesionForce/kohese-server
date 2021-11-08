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

@Injectable({
  providedIn: 'root'
})
export class TreeService {

  constructor() { }

  _favorites: Array<any> = [];
  get favorites() {
    return this._favorites;
  }
  set favorites(value: any) {
    this._favorites = value;
  }

  ngOnInit() {
    // TODO: Add check for favorites in local storage
  }

  getFavorites(): Array<any> {
    // TODO: Implementation of favorites retrieval from localStorage
    return this.favorites;
  }

  addFavorite(element: any): Array<any> {
    try {
      // add element if it is not in the favorites array
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

  removeFavorite(element: any): Array<any> {
    let id = element.item.id;
    try {
      let favoritesElementIndex = this.favorites.findIndex(t => t.item.id === id);
      if(favoritesElementIndex) {
        this.favorites.splice(favoritesElementIndex, 1);
      }

    } catch (error) {
      console.log('!!! Remove from Favorites Error: %s', error);
    }
    return this.favorites;
  }
}
