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


import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { KoheseType } from '../../classes/UDT/KoheseType.class';
import { Comparison, Property } from './comparison.class';

export class ItemProxyComparison extends Comparison {

  private _path: Array<Comparison>;
  get path() {
    return this._path;
  }
  set path(path: Array<Comparison>) {
    this._path = path;
    if (this._path.length) {
      // The parent of the current comparison is the last comparison in the path
      this.parent = this._path[this._path.length - 1];
    }
  }

  // Children Added
  private _childrenAdded: Array<any> = [];
  get childrenAdded(): Array<any> {
    return this._childrenAdded;
  }

  // Children Removed/Deleted
  private _childrenRemoved: Array<any> = [];
  get childrenRemoved(): Array<any> {
    return this._childrenRemoved;
  }

  // Children Moved
  private _childrenMoved: Array<any> = [];
  get childrenMoved(): Array<any> {
    return this._childrenMoved;
  }

  // Item id
  private _itemId: string;
  get itemId(): string {
    return this._itemId;
  }

  public constructor(
    baseObject: any,
    changeObject: any,
    private _dynamicTypesService: DynamicTypesService
    ) {
    super(baseObject, changeObject);
    this._itemId = changeObject ? changeObject.id : baseObject.id;
  }

  protected getProperties(comparisonObject: any): Array<Property> {
    let properties: Array<Property> = [];

    if (comparisonObject) {
      let koheseType: KoheseType = this._dynamicTypesService.getKoheseTypes()[comparisonObject.kind];
      if (koheseType) {
        for (let propertyId in koheseType.fields) {
          properties.push(new Property(propertyId, propertyId, !!koheseType.fields[propertyId].hidden));
        }
      }
    }

    return properties;
  }
}
