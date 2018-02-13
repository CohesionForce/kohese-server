import { Injectable } from '@angular/core';

import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { Subscription } from 'rxjs/Subscription';
import { ItemProxy } from '../../../../common/models/item-proxy';
import { KoheseType } from '../../classes/UDT/KoheseType.class';

@Injectable()
export class DynamicTypesService {
  /* Data */
  modelProxy : ItemProxy;
  typeProxyList : Array<ItemProxy>;
  koheseTypes : object;
  
  private readonly USER_INPUT_TYPES: any = {
    'types': 'Text',
    'proxy-selector': 'Reference',
    'date': 'Date'
  };

  /* Observables */

  /* Subscriptions */
  repoStatusSubscription : Subscription;

  constructor(private ItemRepository : ItemRepository) {
    this.koheseTypes = {};
    this.repoStatusSubscription = this.ItemRepository.getRepoStatusSubject()
    .subscribe((update) => {
    if (update.connected) {
      this.modelProxy = this.ItemRepository.getProxyFor('Model-Definitions');
      this.typeProxyList = this.modelProxy.getDescendants().
        sort((first: ItemProxy, second: ItemProxy) => {
        return ((first.item.name > second.item.name) ?
          1 : ((first.item.name < second.item.name) ? -1 : 0));
      });
      console.log(this.typeProxyList);
      this.buildKoheseTypes();
      }
    })
  }

  getKoheseTypes () : object {
    return this.koheseTypes;
   }

  buildKoheseTypes () : void {
    for (var i : number = 0; i < this.typeProxyList.length; i++) {
      let currentType : ItemProxy = this.typeProxyList[i];
      let viewProxy: ItemProxy = this.getViewProxyFor(currentType);
      this.koheseTypes[currentType.item.name] = new KoheseType(currentType,
        viewProxy);
    }
  }

  getViewProxyFor (modelProxy : ItemProxy) : ItemProxy {
    return this.ItemRepository.getProxyFor('view-' + modelProxy.item.name.toLowerCase());
  }
  
  getUserInputTypes(): any {
    return this.USER_INPUT_TYPES;
  }
}