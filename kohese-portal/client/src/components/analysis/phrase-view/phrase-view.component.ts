import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

import { AnalysisViewComponent, AnalysisViews, AnalysisFilter } from '../AnalysisViewComponent.class';
import { NavigatableComponent } from '../../../classes/NavigationComponent.class';
import { NavigationService } from '../../../services/navigation/navigation.service';

import { ItemProxy } from '../../../../../common/src/item-proxy'
import { BehaviorSubject ,  Subscription ,  Observable } from 'rxjs';
import { AnalysisService } from '../../../services/analysis/analysis.service';
import { DataProcessingService } from '../../../services/data/data-processing.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';

import * as $ from 'jquery';
import { FormControl } from '@angular/forms';

//TODO - implement cross filter comm

@Component({
  selector: 'phrase-view',
  templateUrl: './phrase-view.component.html',
  styleUrls: [
    './phrase-view.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PhraseViewComponent extends AnalysisViewComponent
  implements OnInit, OnDestroy {
  /* UI Switches */
  loadLimit: number = 1000;
  ascending: boolean = true;
  sortField: string = 'count';
  filters: Array<RegExp> = [];
  showPOS: boolean = false;
  syncFilter: boolean;
  filteredCount: number;
  displayedCount: number;
  phrases: Array<any> = [];
  filterOptions : object;
  filterControl : FormControl = new FormControl('');
  lastFilter : AnalysisFilter;
  filterExactMatch : boolean = false;
  filterIgnoreCase : boolean = false;

  /* Data */
  public itemProxy: ItemProxy;

  /* Observables */
  @Input()
  proxyStream : Observable<ItemProxy>;
  @Input()
  public filterSubject: BehaviorSubject<AnalysisFilter>;
  @Output()
  public filterUpdate = new EventEmitter<AnalysisFilter>();

  /* Subscriptions */
  private filterSubjectSubscription: Subscription;
  private proxyStreamSubscription : Subscription;

  constructor(NavigationService: NavigationService, AnalysisService:
    AnalysisService, private dataProcessingService: DataProcessingService,
    private changeRef : ChangeDetectorRef, dialogService: DialogService,
    itemRepository: ItemRepository) {
    super(NavigationService, AnalysisService, dialogService, itemRepository);
  }

  ngOnInit(): void {
    // If sync filter is enable, allow term filters to be applied
    this.syncFilter = true;

    this.proxyStreamSubscription = this.proxyStream.subscribe((newProxy)=>{
      this.itemProxy = newProxy;
      if (this.filterString) {
        this.onFilterChange();
        this.processPhrases();
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
        this.filterControl.setValue(newFilter.filter);
        if (this.itemProxy) {
          this.onFilterChange();
          this.processPhrases();
        }
        this.changeRef.markForCheck();
      }
    });
  }

  toggleLink () {
    this.syncFilter = !this.syncFilter;
    if (this.syncFilter && this.lastFilter) {
      this.filterOptions = this.lastFilter.filterOptions;
      this.filterString = this.lastFilter.filter;
      this.filterControl.setValue(this.filterString);
      if (this.itemProxy) {
        this.onFilterChange();
        this.processPhrases();
      }
      this.changeRef.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this.filterSubjectSubscription.unsubscribe();
    this.proxyStreamSubscription.unsubscribe();
  }

  sort(property: string): void {
    this.sortField === property ? (this.ascending = !this.ascending) : (this.ascending = true);
    this.sortField = property;
    this.processPhrases();
    this.changeRef.markForCheck();
  }


  submitFilter(newFilter) {
    this.filterUpdate.emit({
      source: AnalysisViews.PHRASE_VIEW,
      filter: newFilter,
      filterOptions: {
        ignoreCase: this.filterIgnoreCase,
        exactMatch: this.filterExactMatch
      }
    })
  }

  processPhrases(): void {
    let filteredList = this.dataProcessingService.filter(
      this.itemProxy.analysis.extendedChunkSummaryList, [(input: any) => {
        let matchesPOS = this.AnalysisService.filterPOS(input,
          this.AnalysisService.phraseFilterCriteria[this.analysisPOSFilterName]);
        if (matchesPOS){
          if (this.filterRegex) {
            if (!this.filterRegex.test(input.text)) {
              return false;
            }
            return true;
          } else {
            return true;
          }
        } else {
          return false;
        }
      }]
    );

    this.filteredCount = filteredList.length;

    this.phrases = this.dataProcessingService.sort(filteredList,
      [this.sortField], this.ascending).slice(0, this.loadLimit);

    this.displayedCount = this.phrases.length;
  }
}
