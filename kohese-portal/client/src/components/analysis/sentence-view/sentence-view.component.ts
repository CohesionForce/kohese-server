import { Input, Component, OnInit, OnDestroy } from '@angular/core';

import { AnalysisViewComponent } from '../AnalysisViewComponent.class';
import { NavigatableComponent } from '../../../classes/NavigationComponent.class';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { TabService } from '../../../services/tab/tab.service';
import { AnalysisService } from '../../../services/analysis/analysis.service';

import { ItemProxy } from '../../../../../common/models/item-proxy';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'sentence-view',
  templateUrl : './sentence-view.component.html'
})
export class SentenceViewComponent extends AnalysisViewComponent
                                   implements OnInit, OnDestroy {
 /* UI Switches */
 loadLimit : number;
 reverse : boolean;
 sortField : string;
 /* Data */
 @Input()
 itemProxy : ItemProxy;

 /* Observables */
 @Input()
 filterSubject : BehaviorSubject<string>;

 /* Subscriptions */
 filterSubjectSubscription : Subscription;
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
