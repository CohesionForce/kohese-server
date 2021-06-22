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
import { DynamicTypesService } from '../dynamic-types/dynamic-types.service';
import { KoheseType } from '../../classes/UDT/KoheseType.class';
import { ItemProxy } from '../../../../common/src/item-proxy';

@Injectable()
export class StateService {
  public constructor(private _typeService: DynamicTypesService) {
  }

  public getTransitionCandidates(proxy: ItemProxy): any {
    let transitionCandidates: any = {};
    let type: KoheseType = this._typeService.getKoheseTypes()[proxy.kind];
    for (let fieldName in type.fields) {
      let fieldValue: any = type.fields[fieldName];
      if ('StateMachine' === fieldValue.type) {
        transitionCandidates[fieldName] = {};
        for (let transitionKey in fieldValue.properties.transition) {
          let transition: any = fieldValue.properties.
            transition[transitionKey];
          if (proxy.item[fieldName] === transition.source) {
            transitionCandidates[fieldName][transitionKey] = transition;
          }
        }
      }
    }

    return transitionCandidates;
  }
}
