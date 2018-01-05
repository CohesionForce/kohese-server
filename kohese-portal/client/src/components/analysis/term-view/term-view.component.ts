import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { AnalysisViewComponent } from '../AnalysisViewComponent.class';
import { NavigatableComponent } from '../../../classes/NavigationComponent.class';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { TabService } from '../../../services/tab/tab.service';

import { ItemProxy } from '../../../../../common/models/item-proxy'
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { AnalysisService } from '../../../services/analysis/analysis.service';

import * as $ from 'jquery';
@Component({
  selector: 'term-view',
  templateUrl : './term-view.component.html'
})
export class TermViewComponent extends AnalysisViewComponent
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
    this.filterSubjectSubscription = this.filterSubject.subscribe(newFilter => {
      this.filter = newFilter;
      this.onFilterChange();
    })


    this.loadLimit = 100;
    this.sortField = '-count';
    this.reverse = false;
  }

  ngOnDestroy () {
    this.filterSubjectSubscription.unsubscribe();
  }

  getTermCount = function () {
    return $('#theTokensBody').find('tr').length;
  };

  newSort (term : string) {
    if (this.sortField === term) {
      this.reverse = !this.reverse;
    } else {
      this.sortField = term;
      this.reverse = false;
    }
  }

}
