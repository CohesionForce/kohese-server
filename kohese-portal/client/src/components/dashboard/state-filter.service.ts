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

          // TODO:  Remove this section when the data has been fixed
          // Handle situation when the state name is used instead of the state id
          if(state !== states[state].name){
            stateInfo[type][stateKind].states.push(states[state].name);
            stateInfo[type][stateKind].descriptions.push(states[state].description);
          }
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

