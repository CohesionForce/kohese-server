import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { NavigatableComponent } from '../../../classes/NavigationComponent.class'
import { NavigationService } from '../../../services/navigation/navigation.service';
import { TabService } from '../../../services/tab/tab.service';

import { ItemProxy } from '../../../../../common/models/item-proxy.js';

@Component({
  selector : 'children-tab',
  templateUrl : './children-tab.component.html'
})
export class ChildrenTabComponent extends NavigatableComponent
                                  implements OnInit, OnDestroy{
  @Input()
  itemProxy : ItemProxy;

  itemSortField : string;

  constructor(protected NavigationService : NavigationService,
              protected TabService : TabService) {
    super(NavigationService, TabService);
  }

  ngOnInit() {

  }

  ngOnDestroy () {

  }

}
