import { Component, OnInit, OnDestroy } from '@angular/core';

import { AnalysisViewComponent } from '../AnalysisViewComponent.class';
import { NavigatableComponent } from '../../../classes/NavigationComponent.class';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { TabService } from '../../../services/tab/tab.service';
import { AnalysisService } from '../../../services/analysis/analysis.service';


@Component({
  selector: 'term-view',
  templateUrl : './term-view.component.html'
})
export class TermViewComponent extends AnalysisViewComponent
                                   implements OnInit, OnDestroy {
  constructor(NavigationService : NavigationService,
              TabService : TabService,
              AnalysisService : AnalysisService) {
    super(NavigationService, TabService, AnalysisService);

  }

  ngOnInit () {

  }

  ngOnDestroy () {

  }
}
