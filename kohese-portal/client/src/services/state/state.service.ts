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