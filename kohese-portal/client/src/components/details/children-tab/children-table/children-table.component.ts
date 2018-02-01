import { Component, OnInit, OnDestroy, Input, EventEmitter } from '@angular/core';

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
                                    implements OnInit, OnDestroy {
  @Input()
  itemProxy : ItemProxy;
  @Input()
  filteredItems : Array<ItemProxy>;

  constructor (protected NavigationService : NavigationService) {
    super(NavigationService);
  }

  ngOnInit () {

  }

  ngOnDestroy () {

  }
}
