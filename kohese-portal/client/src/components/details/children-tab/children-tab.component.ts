import { Component, OnInit, OnDestroy, Input, EventEmitter, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

import { NavigatableComponent } from '../../../classes/NavigationComponent.class'
import { NavigationService } from '../../../services/navigation/navigation.service';

import { ItemProxy } from '../../../../../common/src/item-proxy.js';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { Subscription ,  BehaviorSubject ,  Observable } from 'rxjs';

@Component({
  selector : 'children-tab',
  templateUrl : './children-tab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChildrenTabComponent extends NavigatableComponent
                                  implements OnInit, OnDestroy {

  /* Ui Switches */
  orderedChildren : boolean;

  /* Data */
  @Input()
  proxyStream : Observable<ItemProxy>;
  private _editableStream: Observable<boolean>;
  get editableStream() {
    return this._editableStream;
  }
  @Input('editableStream')
  set editableStream(editableStream: Observable<boolean>) {
    this._editableStream = editableStream;
  }

  itemProxy : ItemProxy;
  filterString : string;
  initialized : boolean = false;
  itemSortField : string;

  /* Observables */
  saveEmitter : EventEmitter<ItemProxy>;
  filterSubject : BehaviorSubject<string>;
  childrenStream : BehaviorSubject<Array<ItemProxy>> = new BehaviorSubject([]);


  /* Subscriptions */
  repoReadySub : Subscription;
  proxyChanges : Subscription;


  constructor(protected NavigationService : NavigationService,
              private DialogService : DialogService,
              private ItemRepository : ItemRepository,
              private changeRef : ChangeDetectorRef) {
    super(NavigationService);
  }

  ngOnInit() {
    this.proxyChanges = this.proxyStream.subscribe((newProxy : ItemProxy) => {
      if (newProxy) {
        this.updateProxy(newProxy);
      } else {
        this.itemProxy = undefined;
      }
    })
    this.saveEmitter = new EventEmitter();
    this.filterSubject = new BehaviorSubject('');
    this.initialized = true;
  }

  ngOnDestroy () {
    this.repoReadySub.unsubscribe();
    this.proxyChanges.unsubscribe();
  }

  updateProxy (newProxy : ItemProxy) {
    this.itemProxy = newProxy;
    this.childrenStream.next(this.itemProxy.children);
    this.orderedChildren = this.itemProxy.childrenAreManuallyOrdered();
    this.changeRef.markForCheck();
  }

  onFilterUpdate (filter : string) {
    this.filterSubject.next(filter);
    console.log(filter);
  }

  toggleOrderedChildren () {
    this.itemProxy.toggleChildrenAreManuallyOrdered();
    this.orderedChildren = this.itemProxy.childrenAreManuallyOrdered();
    this.childrenStream.next(this.itemProxy.children);
  }

}
