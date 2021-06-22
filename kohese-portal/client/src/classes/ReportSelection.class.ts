/*
 * Copyright (c) 2021 CohesionForce inc. | www.CohesionForce.com | info@CohesionForce.com
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


import { ItemProxy } from '../../../common/src/item-proxy';

export class ReportSelection {
  get itemProxy() {
    return this._itemProxy;
  }

  private _includeDescendants: boolean = true;
  get includeDescendants() {
    return this._includeDescendants;
  }
  set includeDescendants(includeDescendants: boolean) {
    this._includeDescendants = includeDescendants;
  }

  public constructor(private _itemProxy: ItemProxy) {
  }
}
