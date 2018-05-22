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

  public getStateInfoFor(supportedTypes : Array<string>) {
    let stateInfo = {};
    let types = this._typeService.getKoheseTypes();
    for (let type of supportedTypes) {
      stateInfo[type] = {};
      let typeDef = types[type].dataModelProxy;
      let stateProperties = typeDef.item.stateProperties;
      for (let stateKind of stateProperties) {
        stateInfo[type][stateKind] = {
          states : []
        }
        let states = types[type].fields[stateKind].properties.state;
        for (let state in states) {
          stateInfo[type][stateKind].states.push(state);
        }
      }
    }
    return stateInfo;
  }
}
