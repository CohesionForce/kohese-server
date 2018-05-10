import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';

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
  styleUrls: [ './sentence-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SentenceViewComponent extends AnalysisViewComponent
                                   implements OnInit, OnDestroy {
  /* UI Switches */
  loadLimit: number = 1000;
  ascending: boolean = true;
  sortField: string = null;
  showItemsInDetails: boolean = true;
  showSentencesInDetails: boolean = true;
  showPhrasesInDetails: boolean = false;
  showTokensInDetails: boolean = false;
  syncFilter : boolean;
  filteredCount : number;
  displayedCount : number;
  sentences: Array<any>;
  filterOptions : object;
  lastFilter : AnalysisFilter;

  /* Data */
  public itemProxy: ItemProxy;

  /* Observables */
  @Input()
  public proxyStream : Observable<ItemProxy>;
  @Input()
  public filterSubject: BehaviorSubject<AnalysisFilter>;
  @Output()
  public filterUpdate = new EventEmitter<AnalysisFilter>();

  /* Subscriptions */
  private filterSubjectSubscription: Subscription;
  private proxyStreamSubscription : Subscription;

  constructor(NavigationService: NavigationService,
              AnalysisService: AnalysisService,
              private dataProcessingService: DataProcessingService,
              private changeRef : ChangeDetectorRef) {
    super(NavigationService, AnalysisService);
  }

  ngOnInit(): void {
    this.syncFilter = true;

    this.proxyStreamSubscription = this.proxyStream.subscribe((newProxy)=>{
      this.itemProxy = newProxy;
      if (this.filterString) {
        this.onFilterChange();
        this.processSentences();
      }
      this.changeRef.markForCheck();
    })

    this.filterSubjectSubscription = this.filterSubject.subscribe(newFilter => {
      if (!this.syncFilter && newFilter.source != AnalysisViews.PHRASE_VIEW) {
        this.lastFilter = newFilter;
        return;
      } else {
        this.filterOptions = newFilter.filterOptions;
        this.filterString = newFilter.filter;
        if (this.itemProxy) {
          this.onFilterChange();
          this.processSentences();
        }
        this.changeRef.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    this.filterSubjectSubscription.unsubscribe();
  }

  onCriteriaChange() : void {
    this.processSentences();
    this.changeRef.markForCheck();
  }

  sort(property: string): void {
    if (this.sortField === property){
      if (this.ascending){
        this.ascending = false;
      } else {
        this.sortField = null;
      }
    } else {
      this.sortField = property;
      this.ascending = true;
    }
    this.processSentences();
  }

  toggleLink () {
    this.syncFilter = !this.syncFilter;
    if (this.syncFilter && this.lastFilter) {
      this.filterOptions = this.lastFilter.filterOptions;
      this.filterString = this.lastFilter.filter;
      if (this.itemProxy) {
        this.onFilterChange();
        this.processSentences();
      }
      this.changeRef.markForCheck();
    }
  }

  processSentences(): void {
    let filteredList = this.dataProcessingService.filter(this.itemProxy.analysis.extendedList,
      [(listItem: any) => {

        let result =
          (((listItem.displayLevel === 1 && this.showItemsInDetails) &&
           (this.filterRegex === null ||
            this.filterRegex.test(listItem.item.name) ||
            this.filterRegex.test(listItem.item.description)))) ||
          (((listItem.displayLevel === 2 && this.showSentencesInDetails) ||
            (listItem.displayLevel === 3 && this.showPhrasesInDetails) ||
            (listItem.displayLevel === 4 && this.showTokensInDetails)) &&
          (this.filterRegex === null || this.filterRegex.test(listItem.text)));

        return result;
      }]
    );

    this.filteredCount = filteredList.length;

    if (this.sortField){
      filteredList = this.dataProcessingService.sort(filteredList, [this.sortField], this.ascending);
    }

    this.sentences = filteredList.slice(0, this.loadLimit);
    this.displayedCount = this.sentences.length;

  }
}
