import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

import { AnalysisViewComponent, AnalysisViews, AnalysisFilter } from '../AnalysisViewComponent.class';
import { NavigatableComponent } from '../../../classes/NavigationComponent.class';
import { NavigationService } from '../../../services/navigation/navigation.service';

import { ItemProxy } from '../../../../../common/src/item-proxy'
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { AnalysisService } from '../../../services/analysis/analysis.service';
import { DataProcessingService } from '../../../services/data/data-processing.service';

import * as $ from 'jquery';
import { Observable } from 'rxjs';
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
  loadLimit: number = 100;
  ascending: boolean = true;
  sortField: string = 'count';
  filters: Array<RegExp> = [];
  showPOS: boolean = false;
  syncFilter: boolean;
  filteredCount: number;
  phrases: Array<any> = [];
  filterOptions : object;
  filterControl : FormControl = new FormControl('');

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

  constructor(NavigationService: NavigationService,
    AnalysisService: AnalysisService,
    private dataProcessingService: DataProcessingService, 
    private changeRef : ChangeDetectorRef) {
    super(NavigationService, AnalysisService);
  }

  ngOnInit(): void {
    // If sync filter is enable, allow term filters to be applied
    this.syncFilter = true;

    this.proxyStream.subscribe((newProxy)=>{
      this.itemProxy = newProxy;
      if (this.filterString) {
        this.onFilterChange();
        this.processPhrases();
      }
      this.changeRef.markForCheck();
    })

    this.filterSubjectSubscription = this.filterSubject.subscribe(newFilter => {
      if (!this.syncFilter && newFilter.source != AnalysisViews.PHRASE_VIEW) {
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
        ignoreCase: false,
        exactMatch: false
      }
    })
  }

  processPhrases(): void {
    if (!this.filterRegex) {
      this.phrases = this.dataProcessingService.sort(
        this.itemProxy.analysis.extendedTokenSummaryList,
        [this.sortField], this.ascending).slice(0, this.loadLimit);
    } else {
      this.phrases = this.dataProcessingService.sort(
        this.dataProcessingService.filter(
        this.itemProxy.analysis.extendedTokenSummaryList, [(input: any) => {
          if (!this.filterRegex.test(input.text)) {
            return false;
          }
          return true;
        }]), [this.sortField], this.ascending).slice(0, this.loadLimit);
    }

    this.filteredCount = this.phrases.length;
  }
}
