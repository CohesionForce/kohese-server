import { Injectable } from '@angular/core';
import { DynamicTypesService } from '../dynamic-types/dynamic-types.service';
import { KoheseType } from '../../classes/UDT/KoheseType.class';
import { ItemProxy } from '../../../../common/models/item-proxy';

@Injectable()
export class StateService {
  public constructor(private _typeService: DynamicTypesService) {
  }
  
  public getTransitionCandidates(proxy: ItemProxy): Array<any> {
    let type: KoheseType = this._typeService.getKoheseTypes()[proxy.kind];
    let transitionCandidates: any = {};
    if (type) {
      for (let fieldName in type.stateFlows) {
        transitionCandidates[fieldName] = type.stateFlows[fieldName][proxy.item[fieldName]].
          transitionCandidates;
      }
    }
    
    return transitionCandidates;
  }
}