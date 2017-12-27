import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router/src/router_state';

import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { NavigationService } from '../../services/navigation/navigation.service'
import { TabService } from '../../services/tab/tab.service';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'analysis-view',
  templateUrl : './analysis.component.html'
})
export class AnalysisComponent extends NavigatableComponent
                               implements OnInit, OnDestroy {

  /* UI Toggles */
  showChildren : boolean;
  filterSubject : BehaviorSubject<string>

  constructor(protected NavigationService : NavigationService,
              protected TabService : TabService,
              private router : ActivatedRoute,
              private ItemRepository) {
    super(NavigationService, TabService)

  }

  ngOnInit () {

  }

  ngOnDestroy () {

  }
}

                               }
