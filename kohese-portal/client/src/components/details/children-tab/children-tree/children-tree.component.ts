import { Component, OnInit, OnDestroy, Input, EventEmitter } from '@angular/core';

import { NavigatableComponent } from '../../../../classes/NavigationComponent.class'
import { NavigationService } from '../../../../services/navigation/navigation.service';

import * as ItemProxy from '../../../../../../common/models/item-proxy.js';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector : 'children-tree',
  templateUrl : './children-tree.component.html'
})

export class ChildrenTreeComponent extends NavigatableComponent {
  @Input()
  itemProxy : ItemProxy;
  @Input()
  filteredItems : Array<ItemProxy>;

  constructor (protected NavigationService : NavigationService) {
    super(NavigationService);
  }
}
