import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventEmitter } from 'events';

import { ItemProxy } from '../../../../../common/models/item-proxy.js';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { TabService } from '../../../services/tab/tab.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';

import { RowComponent } from '../../../classes/RowComponent.class';
import { ProxyFilter } from '../../../classes/ProxyFilter.class';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'tree-row',
  templateUrl : './tree-row.component.html'
})
export class TreeRowComponent extends RowComponent
                              implements OnInit, OnDestroy {
  /* UI Triggers
     RowComponent : exactFilter
                    collapsed */

  /* Data
     RowComponent : proxyCollection */

  /* Observables
     RowComponent : filterSubject */

  /* Subscriptions */
  filterSubscription : Subscription;

  constructor(NavigationService : NavigationService,
    TabService : TabService, private dialogService: DialogService,
    private itemRepository: ItemRepository) {
    super(NavigationService, TabService);
  }

  ngOnInit(): void {
    this.filterSubscription = this.filterSubject.subscribe(newFilter => {
      this.filter = newFilter;
    });
  }

  ngOnDestroy(): void {
    this.filterSubscription.unsubscribe();
  }

  removeItem(proxy: ItemProxy): void {
    this.dialogService.openCustomDialog('Confirm Deletion',
      'Are you sure you want to delete ' + proxy.item.name + '?',
      ['Cancel', 'Delete', 'Delete Recursively']).
      subscribe((result) => {
      if (result) {
        this.itemRepository.deleteItem(proxy, (2 === result));
      }
    });
  }
}
