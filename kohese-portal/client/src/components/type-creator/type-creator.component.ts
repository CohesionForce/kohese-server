import { Component, OnInit, OnDestroy } from '@angular/core';

import { NavigatableComponent } from '../../classes/NavigationComponent.class';

import { NavigationService } from '../../services/navigation/navigation.service';
import { TabService } from '../../services/tab/tab.service';

@Component({
  selector: 'type-creator',
  templateUrl : './type-creator.component.html'
})

export class TypeCreatorComponent extends NavigatableComponent
                                  implements OnInit, OnDestroy {

  /* UI Switches */

  constructor(NavigationService : NavigationService,
              TabService : TabService) {
    super(NavigationService, TabService)
  }

  ngOnInit () {

  }

  ngOnDestroy () {

  }
}
