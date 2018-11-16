import { Component, OnInit, OnDestroy, Input, EventEmitter, OnChanges } from '@angular/core';

import { NavigatableComponent } from '../../../../classes/NavigationComponent.class'
import { NavigationService } from '../../../../services/navigation/navigation.service';

import { ItemProxy } from '../../../../../../common/src/item-proxy.js';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';
import { Subscription } from 'rxjs';

@Component({
  selector : 'proxy-selector-tree',
  templateUrl : './proxy-selector-tree.component.html'
})

export class ProxySelectorTreeComponent extends NavigatableComponent
                                   implements OnInit, OnDestroy, OnChanges{
  @Input()
  itemProxy : ItemProxy;
  filteredItems : Array<ItemProxy>;

  constructor (protected NavigationService : NavigationService) {
    super(NavigationService);
  }

  ngOnInit () {
    this.filteredItems = this.itemProxy.children
  }

  ngOnDestroy () {

  }

  ngOnChanges (changes) {
    this.itemProxy = (changes.itemProxy) ? changes.itemProxy.currentValue : changes.currentValue;
    this.filteredItems = this.itemProxy.children;
  }
}
