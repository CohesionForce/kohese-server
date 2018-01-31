import { Component, OnInit, OnDestroy, Input, EventEmitter } from '@angular/core';

import { NavigatableComponent } from '../../../classes/NavigationComponent.class'
import { CreateItemComponent } from '../../../components/create-item/create-item.component';
import { NavigationService } from '../../../services/navigation/navigation.service';

import { ItemProxy } from '../../../../../common/models/item-proxy.js';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector : 'children-tab',
  templateUrl : './children-tab.component.html'
})
export class ChildrenTabComponent extends NavigatableComponent
                                  implements OnInit, OnDestroy{

  /* Ui Switches */
  orderedChildren : boolean;
  treeOptions : object

  /* Data */
  @Input()
  itemProxy : ItemProxy;
  filterString : string;

  itemSortField : string;

  filteredItems : Array<ItemProxy>;

  /* Observables */
  saveEmitter : EventEmitter<ItemProxy>;


  /* Subscriptions */
  repoReadySub : Subscription;


  constructor(protected NavigationService : NavigationService,
              private DialogService : DialogService,
              private ItemRepository : ItemRepository) {
    super(NavigationService);
  }

  ngOnInit() {
    this.orderedChildren = this.itemProxy.childrenAreManuallyOrdered();
    this.filteredItems = this.itemProxy.children;
    this.repoReadySub = this.ItemRepository.getRepoStatusSubject()
      .subscribe(update => {
        if (update.connected) {

          console.log(this.filteredItems);
        }
      })
    this.saveEmitter = new EventEmitter();
    this.treeOptions = {
      displayField : 'item.name',
      idField : 'item.id'
    };

    console.log(this.filteredItems);
  }

  consolelog(any) {
    console.log(any);
  }

  ngOnDestroy () {
  }

  toggleOrderedChildren () {
    this.itemProxy.toggleChildrenAreManuallyOrdered();
    this.orderedChildren = this.itemProxy.childrenAreManuallyOrdered();
  }

  createChild () {
    let createData = {
      saveEmitter : this.saveEmitter,
      parentId : this.itemProxy.item.id
    };

    let dialogReference =
    this.DialogService.openComponentDialog(CreateItemComponent,
                                           createData);

    this.saveEmitter.subscribe((proxy) => {
      console.log(proxy);
      this.ItemRepository.upsertItem(proxy);
    })
  }
}
