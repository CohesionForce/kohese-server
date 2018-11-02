import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { AnalysisViewComponent, AnalysisFilter, AnalysisViews } from '../AnalysisViewComponent.class';
import { NavigatableComponent } from '../../../classes/NavigationComponent.class';
import { NavigationService } from '../../../services/navigation/navigation.service';

import { ItemProxy } from '../../../../../common/src/item-proxy'
import { BehaviorSubject ,  Subscription ,  Observable } from 'rxjs';
import { AnalysisService } from '../../../services/analysis/analysis.service';
import { DataProcessingService } from '../../../services/data/data-processing.service';

import * as $ from 'jquery';
import { FormControl } from '@angular/forms';
@Component({
  selector: 'term-view',
  templateUrl : './term-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermViewComponent extends AnalysisViewComponent
                                   implements OnInit, OnDestroy {
   /* UI Switches */
   loadLimit: number = 1000;
   ascending: boolean = true;
   sortField: string = 'count';
   filters: Array<RegExp> = [];
   filterOptions : object;
   filterExactMatch: boolean = false;
   filterIgnoreCase: boolean = false;
   analysisFilterInput: string;
   showPOS: boolean = false;
   selfFilter : boolean;
   filteredCount : number;
   displayedCount : number;
   terms: Array<any>;

   /* Data */
   public itemProxy: ItemProxy;
   filterControl = new FormControl('');

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

   constructor(NavigationService: NavigationService,
              AnalysisService: AnalysisService,
              private dataProcessingService: DataProcessingService,
              private changeRef : ChangeDetectorRef) {
     super(NavigationService, AnalysisService);
   }

  ngOnInit(): void {
    this.selfFilter = true;
    this.proxyStreamSubscription = this.proxyStream.subscribe((newProxy)=>{
      this.itemProxy = newProxy;
      if (this.filterString) {
        this.onFilterChange();
        this.processTerms();
      }
      this.changeRef.markForCheck();
    })

    this.filterSubjectSubscription = this.filterSubject.subscribe(newFilter => {
      if (this.selfFilter && newFilter.source != AnalysisViews.TERM_VIEW) {
        return;
      } else {
        this.filterOptions = newFilter.filterOptions;
        this.filterString = newFilter.filter;
        this.filterControl.setValue(newFilter.filter);
        if (this.itemProxy) {
          this.onFilterChange();
          this.processTerms();
        }
        this.changeRef.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    this.filterSubjectSubscription.unsubscribe();
    this.proxyStreamSubscription.unsubscribe();
  }

  sort(property: string): void {
    this.sortField === property ? (this.ascending = !this.ascending) : (this.ascending = true);
    this.sortField = property;
    this.processTerms();
    this.changeRef.markForCheck();
  }

  submitFilter (filterInput) {
    this.filterUpdate.next({
      source: AnalysisViews.TERM_VIEW,
      filter: filterInput,
      filterOptions: {
        exactMatch: this.filterExactMatch,
        ignoreCase: this.filterIgnoreCase
      }
    })
  }

  processTerms(): void {
    let filteredList = this.dataProcessingService.filter(
      this.itemProxy.analysis.extendedTokenSummaryList, [(input: any) => {
        let matchesPOS = this.AnalysisService.filterPOS(input,
          this.AnalysisService.termFilterCriteria[this.analysisPOSFilterName]);
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

    this.terms = this.dataProcessingService.sort(filteredList,[this.sortField],
      this.ascending).slice(0, this.loadLimit);

    this.displayedCount = this.terms.length;
  }
}
