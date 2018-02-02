import { Component, OnInit, OnDestroy, Input, EventEmitter, OnChanges } from '@angular/core';

import { NavigatableComponent } from '../../../../classes/NavigationComponent.class'
import { NavigationService } from '../../../../services/navigation/navigation.service';

import { ItemProxy } from '../../../../../../common/models/item-proxy.js';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { MatTableDataSource } from '@angular/material'

@Component({
  selector : 'children-table',
  templateUrl : './children-table.component.html'
})
export class ChildrenTableComponent extends NavigatableComponent
                                    implements OnInit, OnDestroy, OnChanges {
  @Input()
  itemProxy : ItemProxy;
  @Input()
  filterSubject : BehaviorSubject<string>;

  /* Obvervables */
  filteredItems : Array<ItemProxy>;
  childrenStream : MatTableDataSource<ItemProxy>;

  /* Subscriptions */
  filterSub : Subscription;

  /* Data */
  initialized : boolean;
  rowDef : Array<string>;

  constructor (protected NavigationService : NavigationService) {
    super(NavigationService);
    this.initialized = false;
  }

  ngOnInit () {
    this.childrenStream = new MatTableDataSource<ItemProxy>(this.itemProxy.children)
    this.initialized = true;
    this.rowDef = ['name','assignedTo','actionState','description']
    this.filterSub = this.filterSubject.subscribe((newFilter) => {
      this.childrenStream.filter = newFilter.trim().toLowerCase();
      console.log(this.childrenStream);
    })
  }

  ngOnDestroy () {
    this.filterSub.unsubscribe();
  }

  consolelog(string) {
    console.log(string);
  }

  ngOnChanges (changes) {
    if(this.initialized) {
      this.itemProxy = (changes.itemProxy) ? changes.itemProxy.currentValue : changes.currentValue;
      this.childrenStream.data = this.itemProxy.children
    }
  }
}
