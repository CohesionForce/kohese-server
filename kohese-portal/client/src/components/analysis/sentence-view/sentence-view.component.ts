import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';

import { AnalysisViewComponent, AnalysisFilter, AnalysisViews } from '../AnalysisViewComponent.class';
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
  templateUrl : './sentence-view.component.html',
  styleUrls: [ './sentence-view.component.scss']
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
  syncFilter : boolean;
  filteredCount : number;
  sentences: Array<any>;
  
  /* Data */
  @Input()
  public itemProxy: ItemProxy;

  /* Observables */
  @Input()
  public filterSubject: BehaviorSubject<AnalysisFilter>;
  @Output()
  public filterUpdate = new EventEmitter<AnalysisFilter>();

  /* Subscriptions */
  private filterSubjectSubscription: Subscription;
  
  constructor(NavigationService: NavigationService,
              AnalysisService: AnalysisService,
              private dataProcessingService: DataProcessingService) {
    super(NavigationService, AnalysisService);
  }

  ngOnInit(): void {
    this.syncFilter = true;
    this.filterSubjectSubscription = this.filterSubject.subscribe(newFilter => {
      if (!this.syncFilter && newFilter.source !== AnalysisViews.SENTENCE_VIEW) {
        return;
      } else {
        this.filterString = newFilter.filter;
        this.onFilterChange();
        this.processSentences();
      }
    });
    
  }

  ngOnDestroy(): void {
    this.filterSubjectSubscription.unsubscribe();
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

    this.filteredCount = this.sentences.length;
  }
}
