import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { NavigatableComponent } from '../../classes/NavigationComponent.class'
import { NavigationService } from '../../services/navigation/navigation.service';

import { ItemProxy } from '../../../../common/models/item-proxy.js'

@Component({
  selector : 'action-table',
  templateUrl : './action-table.component.html'
})
export class ActionTableComponent extends NavigatableComponent
                                  implements OnInit, OnDestroy{
  @Input()
  itemProxy : ItemProxy;

  constructor(protected NavigationService : NavigationService) {
    super(NavigationService);
  }

  ngOnInit() {
  }

  ngOnDestroy () {
  }
}
