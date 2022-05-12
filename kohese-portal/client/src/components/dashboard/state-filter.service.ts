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


import { DynamicTypesService } from './../../services/dynamic-types/dynamic-types.service';
import { Injectable } from '@angular/core';


@Injectable()
export class StateFilterService {
  constructor (private typeService : DynamicTypesService) {

  }

  public getStateInfoFor(supportedTypes : Array<string>) {
    let stateInfo = {};
    let types = this.typeService.getKoheseTypes();
    for (let type of supportedTypes) {
      stateInfo[type] = {};
      let typeDef = types[type].dataModelProxy;
      let stateProperties = typeDef.item.stateProperties;
      for (let stateKind of stateProperties) {
        stateInfo[type][stateKind] = {
          states : [],
          descriptions : []
        }
        let states = types[type].fields[stateKind].properties.state;
        for (let state in states) {
          stateInfo[type][stateKind].states.push(state);
          stateInfo[type][stateKind].descriptions.push(states[state].description);
        }
      }
    }
    return stateInfo;
  }
}

export interface StateInfo {
  type : string,
  stateType : string,
  state : string
}

