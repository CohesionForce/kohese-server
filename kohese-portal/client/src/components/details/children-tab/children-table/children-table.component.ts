import { Component, OnInit, OnDestroy, Input, EventEmitter, OnChanges } from '@angular/core';

import { NavigatableComponent } from '../../../../classes/NavigationComponent.class'
import { NavigationService } from '../../../../services/navigation/navigation.service';

import { ItemProxy } from '../../../../../../common/models/item-proxy.js';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector : 'children-table',
  templateUrl : './children-table.component.html'
})
export class ChildrenTableComponent extends NavigatableComponent
                                    implements OnInit, OnDestroy, OnChanges {
  @Input()
  itemProxy : ItemProxy;
  filteredItems : Array<ItemProxy>;

  constructor (protected NavigationService : NavigationService) {
    super(NavigationService);
  }

  ngOnInit () {
    this.filteredItems = this.itemProxy.children;
  }

  ngOnDestroy () {

  }

  ngOnChanges (changes) {
    this.itemProxy = (changes.itemProxy) ? changes.itemProxy.currentValue : changes.currentValue;
    this.filteredItems = this.itemProxy.children;
  }
}
