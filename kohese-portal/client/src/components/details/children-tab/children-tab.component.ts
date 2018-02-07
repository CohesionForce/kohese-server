import { Component, OnInit, OnDestroy, Input, EventEmitter } from '@angular/core';

import { NavigatableComponent } from '../../../classes/NavigationComponent.class'
import { NavigationService } from '../../../services/navigation/navigation.service';

import { ItemProxy } from '../../../../../common/models/item-proxy.js';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { CreateWizardComponent } from '../../create-wizard/create-wizard.component';

@Component({
  selector : 'children-tab',
  templateUrl : './children-tab.component.html'
})
export class ChildrenTabComponent extends NavigatableComponent
                                  implements OnInit, OnDestroy{

  /* Ui Switches */
  orderedChildren : boolean;
  treeOptions : object
  childView : string

  /* Data */
  @Input()
  itemProxy : ItemProxy;
  filterString : string;

  itemSortField : string;

  /* Observables */
  saveEmitter : EventEmitter<ItemProxy>;
  filterSubject : BehaviorSubject<string>;


  /* Subscriptions */
  repoReadySub : Subscription;


  constructor(protected NavigationService : NavigationService,
              private DialogService : DialogService,
              private ItemRepository : ItemRepository) {
    super(NavigationService);
  }

  ngOnInit() {
    this.orderedChildren = this.itemProxy.childrenAreManuallyOrdered();
    this.repoReadySub = this.ItemRepository.getRepoStatusSubject()
      .subscribe(update => {
        if (update.connected) {
          this.childView = 'table';
        }
      })
    this.saveEmitter = new EventEmitter();
    this.filterSubject = new BehaviorSubject('');
  }

  consolelog(any) {
    console.log(any);
  }

  ngOnDestroy () {
  }

  onFilterUpdate (filter : string) {
    this.filterSubject.next(filter);
    console.log(filter);
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
    this.DialogService.openComponentDialog(CreateWizardComponent,
                                           createData);

    this.saveEmitter.subscribe((proxy) => {
      console.log(proxy);
      this.ItemRepository.upsertItem(proxy);
    })
  }
}
