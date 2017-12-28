import { Component, Input, OnInit, OnDestroy } from '@angular/core';

import { NavigatableComponent } from '../../../classes/NavigationComponent.class'
import { NavigationService } from '../../../services/navigation/navigation.service';
import { TabService } from '../../../services/tab/tab.service';

import { ItemProxy } from '../../../../../common/models/item-proxy.js';
@Component({
  selector : 'history-tab',
  templateUrl : './history-tab.component.html'
})
export class HistoryTabComponent extends NavigatableComponent
                                  implements OnInit, OnDestroy{
  @Input()
  itemProxy : ItemProxy

  constructor(protected NavigationService : NavigationService,
              protected TabService : TabService) {
    super(NavigationService, TabService);
  }

  ngOnInit() {

  }

  ngOnDestroy () {

  }

}
