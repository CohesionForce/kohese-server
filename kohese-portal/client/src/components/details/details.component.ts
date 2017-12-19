import { Component, OnInit, OnDestroy } from '@angular/core';

import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { TabService } from '../../services/tab/tab.service';
import { NavigationService } from '../../services/navigation/navigation.service';

@Component({
  selector : 'details-view',
  templateUrl : './details.component.html'
})

export class DetailsComponent extends NavigatableComponent
                              implements OnInit, OnDestroy {

  constructor (protected NavigationService : NavigationService,
               protected TabService : TabService ) {
    super(NavigationService, TabService);
    }

  ngOnInit () {

  }

  ngOnDestroy () {

  }
}
