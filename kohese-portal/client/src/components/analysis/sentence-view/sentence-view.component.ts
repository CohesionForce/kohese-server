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
  selector: 'sentence-view',
  templateUrl : './sentence-view.component.html'
})
export class SentenceViewComponent extends AnalysisViewComponent
                                   implements OnInit, OnDestroy {
 /* UI Switches */
 loadLimit : number;
 reverse : boolean;
 sortField : string;
 showSentencesInDetails : boolean;
 showPhrasesInDetails : boolean;
 showTokensInDetails : boolean;
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
    this.showSentencesInDetails = true;
    this.showPhrasesInDetails = false;
    this.showTokensInDetails = false;

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

  getDetailsItemCount = function () {
    return $('#theDetailsBody').find('tr').length;
  };

  newSort (term : string) {
    if (this.sortField === term) {
      this.reverse = !this.reverse;
    } else {
      this.sortField = term;
      this.reverse = false;
    }
  }
  filterDetails (listItem) : boolean {
    return listItem.displayLevel == 1 &&
                (this.filterRegex === null ||
                 this.filterRegex.test(listItem.item.name) ||
                 this.filterRegex.test(listItem.item.description)) ||
               (listItem.displayLevel == 2 && this.showSentencesInDetails ||
                listItem.displayLevel == 3 && this.showPhrasesInDetails ||
                listItem.displayLevel == 4 && this.showTokensInDetails
               ) &&
                (this.filterRegex === null || this.filterRegex.test(listItem.text));
  };
}
