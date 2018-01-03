import { Injectable } from '@angular/core';
import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { NavigationService } from '../../services/navigation/navigation.service';
import { TabService } from '../../services/tab/tab.service';

/* Here is where we will setup the base methods for all the analysis components */

@Injectable()
export class AnalysisViewComponent extends NavigatableComponent{
  constructor(NavigationService : NavigationService,
              TabService : TabService) {
    super(NavigationService, TabService);

  }
}
