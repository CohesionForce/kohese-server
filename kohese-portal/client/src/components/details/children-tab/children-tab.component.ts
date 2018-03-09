import { Component, OnInit, OnDestroy, Input, EventEmitter, SimpleChange, OnChanges, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

import { NavigatableComponent } from '../../../classes/NavigationComponent.class'
import { NavigationService } from '../../../services/navigation/navigation.service';

import * as ItemProxy from '../../../../../common/src/item-proxy.js';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository, RepoStates } from '../../../services/item-repository/item-repository.service';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { CreateWizardComponent } from '../../create-wizard/create-wizard.component';
import { Observable } from 'rxjs/Observable';

@Component({
  selector : 'children-tab',
  templateUrl : './children-tab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChildrenTabComponent extends NavigatableComponent
                                  implements OnInit, OnDestroy {

  /* Ui Switches */
  orderedChildren : boolean;
  treeOptions : object
  childView : string

  /* Data */
  @Input()
  proxyStream : Observable<ItemProxy>;

  itemProxy : ItemProxy;
  filterString : string;
  initialized : boolean = false;
  itemSortField : string;

  /* Observables */
  saveEmitter : EventEmitter<ItemProxy>;
  filterSubject : BehaviorSubject<string>;
  childrenStream : BehaviorSubject<ItemProxy> = new BehaviorSubject([]);


  /* Subscriptions */
  repoReadySub : Subscription;


  constructor(protected NavigationService : NavigationService,
              private DialogService : DialogService,
              private ItemRepository : ItemRepository,
              private changeRef : ChangeDetectorRef) {
    super(NavigationService);
  }

  ngOnInit() {
    this.proxyStream.subscribe((newProxy : ItemProxy) => {
     this.updateProxy(newProxy); 
    })
    this.orderedChildren = this.itemProxy.childrenAreManuallyOrdered();
    this.repoReadySub = this.ItemRepository.getRepoStatusSubject()
      .subscribe(update => {
        if (RepoStates.SYNCHRONIZATION_SUCCEEDED === update.state) {
          this.childView = 'table';
        }
      })
    this.saveEmitter = new EventEmitter();
    this.filterSubject = new BehaviorSubject('');
    this.initialized = true;
  }

  ngOnDestroy () {
    this.repoReadySub.unsubscribe();
  }

  updateProxy (newProxy : ItemProxy) {
    this.itemProxy = newProxy;
    this.childrenStream.next(this.itemProxy.children);
    this.changeRef.markForCheck();
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
