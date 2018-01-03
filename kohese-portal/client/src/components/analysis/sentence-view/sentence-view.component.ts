import { Component, OnInit, OnDestroy } from '@angular/core';

import { AnalysisViewComponent } from '../AnalysisViewComponent.class';
import { NavigatableComponent } from '../../../classes/NavigationComponent.class';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { TabService } from '../../../services/tab/tab.service';

@Component({
  selector: 'sentence-view',
  templateUrl : './sentence-view.component.html'
})
export class SentenceViewComponent extends AnalysisViewComponent
                                   implements OnInit, OnDestroy {

  constructor(NavigationService : NavigationService,
              TabService : TabService) {
  super(NavigationService, TabService);

  }

  ngOnInit () {

  }

  ngOnDestroy () {

  }
}
