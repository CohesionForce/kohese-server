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
          states : []
        }
        let states = types[type].fields[stateKind].properties.state;
        console.log('!!!');
        console.log(states);
        for (let state in states) {
          console.log(state);
          stateInfo[type][stateKind].states.push(states[state].name);
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

