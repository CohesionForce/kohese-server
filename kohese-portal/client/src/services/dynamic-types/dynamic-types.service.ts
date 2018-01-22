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
  typeList : Array<KoheseType>;

  /* Observables */

  /* Subscriptions */
  repoStatusSubscription : Subscription;

  constructor(private ItemRepository : ItemRepository) {
    this.repoStatusSubscription = this.ItemRepository.getRepoStatusSubject()
    .subscribe((update) => {
    if (update.connected) {
      this.modelProxy = this.ItemRepository.getProxyFor('Model-Definitions');
      this.typeList = this.modelProxy.getDescendants();
      console.log(this.typeList);
      }
    })
  }
}
