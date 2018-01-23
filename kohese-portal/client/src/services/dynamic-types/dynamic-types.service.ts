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

  /* Observables */

  /* Subscriptions */
  repoStatusSubscription : Subscription;

  constructor(private ItemRepository : ItemRepository) {
    this.koheseTypes = {};
    this.repoStatusSubscription = this.ItemRepository.getRepoStatusSubject()
    .subscribe((update) => {
    if (update.connected) {
      this.modelProxy = this.ItemRepository.getProxyFor('Model-Definitions');
      this.typeProxyList = this.modelProxy.getDescendants();
      console.log(this.typeProxyList);
      this.buildKoheseTypes();
      }
    })
  }

  getKoheseTypes () : object {
    return this.koheseTypes;
   }

  buildKoheseTypes () : void {
    for (var i : number; i < this.typeProxyList.length; i++) {
      let currentType : ItemProxy = this.typeProxyList[i];
      this.koheseTypes[currentType.item.name] = new KoheseType(currentType);
    }
  }
}
