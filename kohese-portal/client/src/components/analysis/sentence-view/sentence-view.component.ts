import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { AnalysisViewComponent } from '../AnalysisViewComponent.class';
import { NavigatableComponent } from '../../../classes/NavigationComponent.class';
import { NavigationService } from '../../../services/navigation/navigation.service';

import { ItemProxy } from '../../../../../common/src/item-proxy'
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { AnalysisService } from '../../../services/analysis/analysis.service';
import { DataProcessingService } from '../../../services/data/data-processing.service';

import * as $ from 'jquery';

@Component({
  selector: 'sentence-view',
  templateUrl : './sentence-view.component.html'
})
export class SentenceViewComponent extends AnalysisViewComponent
                                   implements OnInit, OnDestroy {
  /* UI Switches */
  loadLimit: number = 100;
  ascending: boolean = true;
  sortField: string = 'count';
  showSentencesInDetails: boolean = true;
  showPhrasesInDetails: boolean = false;
  showTokensInDetails: boolean = false;
  
  sentences: Array<any>;
  
  /* Data */
  @Input()
  public itemProxy: ItemProxy;

  /* Observables */
  @Input()
  public filterSubject: BehaviorSubject<string>;

  /* Subscriptions */
  private filterSubjectSubscription: Subscription;
  
  constructor(NavigationService: NavigationService,
              AnalysisService: AnalysisService,
              private dataProcessingService: DataProcessingService) {
    super(NavigationService, AnalysisService);
  }

  ngOnInit(): void {
    this.filterSubjectSubscription = this.filterSubject.subscribe(newFilter => {
      this.filterString = newFilter;
      this.onFilterChange();
    });
    
    this.processSentences();
  }

  ngOnDestroy(): void {
    this.filterSubjectSubscription.unsubscribe();
  }

  getDetailsItemCount(): number {
    return $('#theDetailsBody').find('tr').length;
  }
  
  sort(property: string): void {
    this.sortField === property ? (this.ascending = !this.ascending) : (this.ascending = true);
    this.sortField = property;
    this.processSentences();
  }
  
  processSentences(): void {
    this.sentences = this.dataProcessingService.sort(
      this.dataProcessingService.filter(this.itemProxy.analysis.extendedList,
      [(listItem: any) => {
        return listItem.displayLevel === 1 &&
          (this.filterRegex === null ||
          this.filterRegex.test(listItem.item.name) ||
          this.filterRegex.test(listItem.item.description)) ||
          (listItem.displayLevel === 2 && this.showSentencesInDetails ||
          listItem.displayLevel === 3 && this.showPhrasesInDetails ||
          listItem.displayLevel === 4 && this.showTokensInDetails) &&
          (this.filterRegex === null || this.filterRegex.test(listItem.text));
      }]), [this.sortField], this.ascending).slice(0, this.loadLimit);
  }
}
