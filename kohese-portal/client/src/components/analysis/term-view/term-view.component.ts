import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { AnalysisViewComponent } from '../AnalysisViewComponent.class';
import { NavigatableComponent } from '../../../classes/NavigationComponent.class';
import { NavigationService } from '../../../services/navigation/navigation.service';

import { ItemProxy } from '../../../../../common/models/item-proxy'
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { AnalysisService } from '../../../services/analysis/analysis.service';
import { DataProcessingService } from '../../../services/data/data-processing.service';

import * as $ from 'jquery';
@Component({
  selector: 'term-view',
  templateUrl : './term-view.component.html'
})
export class TermViewComponent extends AnalysisViewComponent
                                   implements OnInit, OnDestroy {
   /* UI Switches */
   private loadLimit: number = 100;
   private ascending: boolean = true;
   private sortField: string = 'count';
   private filters: Array<RegExp> = [];
   private filterExactMatch: boolean = false;
   private filterIgnoreCase: boolean = false;
   private analysisFilterInput: string;
   
   private terms: Array<any>;
   /* Data */
   @Input()
   private itemProxy: ItemProxy;

   /* Observables */
   @Input()
   private filterSubject: BehaviorSubject<string>;

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

    this.processTerms();
    console.log(this);
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
    this.processTerms();
  }
  
  filter(f: string, manual: boolean): void {
    if (manual) {
      if (this.filterExactMatch) {
        f = '/\\b' + f + '\\b/';
        if (this.filterIgnoreCase) {
          f += 'i';
        }
      }
    }
      
    let regex: RegExp = new RegExp(f);
    let index: number = this.filters.indexOf(regex);
    if (-1 === index) {
      this.filters.push(regex);
    } else {
      this.filters.splice(index, 1);
    }
    
    this.processTerms();
  }

  processTerms(): void {
    this.terms = this.dataProcessingService.sort(
      this.dataProcessingService.filter(
      this.itemProxy.analysis.extendedTokenSummaryList, [(input: any) => {
        for (let j: number = 0; j < this.filters.length; j++) {
          if (!this.filters[j].test(input)) {
            return false;
          }
        }
        
        return true;
      }]), [this.sortField], this.ascending).slice(0, this.loadLimit);
  }
}