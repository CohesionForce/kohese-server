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
import { FormControl } from '@angular/forms';
@Component({
  selector: 'term-view',
  templateUrl : './term-view.component.html'
})
export class TermViewComponent extends AnalysisViewComponent
                                   implements OnInit, OnDestroy {
   /* UI Switches */
   loadLimit: number = 100;
   ascending: boolean = true;
   sortField: string = 'count';
   filters: Array<RegExp> = [];
   filterExactMatch: boolean = false;
   filterIgnoreCase: boolean = false;
   analysisFilterInput: string;
   showPOS: boolean = false;
   
   terms: Array<any>;

   /* Data */
   @Input()
   public itemProxy: ItemProxy;
   filterControl = new FormControl('');

   /* Observables */
   @Input()
   public filterSubject: BehaviorSubject<string>;
   @Output()
   public newFilter = new EventEmitter<AnalysisFilter>()

   /* Subscriptions */
   private filterSubjectSubscription: Subscription;

   constructor(NavigationService: NavigationService,
              AnalysisService: AnalysisService,
              private dataProcessingService: DataProcessingService) {
     super(NavigationService, AnalysisService);
   }

  ngOnInit(): void {
    this.filterSubjectSubscription = this.filterSubject.subscribe(newFilter => {
      console.log(newFilter)
      this.filterString = newFilter;
      this.onFilterChange();
    });

    // this.processTerms();
    this.getTermCount();
  }

  ngOnDestroy(): void {
    this.filterSubjectSubscription.unsubscribe();
  }

  getTermCount(): number {
    return $('#theTokensBody').find('tr').length;
  }
  
  sort(property: string): void {
    this.sortField === property ? (this.ascending = !this.ascending) : (this.ascending = true);
    this.sortField = property;
    // this.processTerms();
  }
  
  // filter(f: string, manual: boolean): void {
  //   if (manual) {
  //     if (this.filterExactMatch) {
  //       f = '/\\b' + f + '\\b/';
  //       if (this.filterIgnoreCase) {
  //         f += 'i';
  //       }
  //     }
  //   }
      
  //   let regex: RegExp = new RegExp(f);
  //   let index: number = this.filters.indexOf(regex);
  //   if (-1 === index) {
  //     this.filters.push(regex);
  //   } else {
  //     this.filters.splice(index, 1);
  //   }
    
  //   this.processTerms();
  // }

  // processTerms(): void {
  //   this.terms = this.dataProcessingService.sort(
  //     this.dataProcessingService.filter(
  //     this.itemProxy.analysis.extendedTokenSummaryList, [(input: any) => {
  //       for (let j: number = 0; j < this.filters.length; j++) {
  //         if (!this.filters[j].test(input)) {
  //           return false;
  //         }
  //       }
        
  //       return true;
  //     }]), [this.sortField], this.ascending).slice(0, this.loadLimit);
  // }
}
