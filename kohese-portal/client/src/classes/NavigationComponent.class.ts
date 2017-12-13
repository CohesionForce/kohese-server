import { Injectable } from '@angular/core';

import { NavigationService } from '../services/navigation/navigation.service';
import { TabService } from '../services/tab/tab.service';
import { Tab } from '../services/tab/Tab.class';

@Injectable()
export class NavigatableComponent {
  protected NavigationService : NavigationService;
  protected TabService : TabService;
  protected tab : Tab;

  constructor (NavigationService : NavigationService,
               TabService : TabService ) {
    this.NavigationService = NavigationService;
    this.TabService = TabService;
    this.TabService.getCurrentTab()
      .subscribe(tab => { this.tab = tab;})

  }

  navigate (route : string, params: object) {
    this.NavigationService.navigate(route, params, this.tab.id);
  }
}
