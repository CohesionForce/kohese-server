/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// Angular
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter,
  ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material';
import { BehaviorSubject ,  Subscription ,  Observable } from 'rxjs';

// NPM

// Kohese
import { AnalysisViewComponent, AnalysisFilter, AnalysisViews } from '../AnalysisViewComponent.class';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { AnalysisService } from '../../../services/analysis/analysis.service';
import { DataProcessingService } from '../../../services/data/data-processing.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';

@Component({
  selector: 'term-view',
  templateUrl : './term-view.component.html',
  styleUrls: ['./term-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermViewComponent extends AnalysisViewComponent
                                   implements OnInit, OnDestroy {
   /* UI Switches */
   loadLimit: number = 1000;
   ascending: boolean = false;
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
   termsDataSource: MatTableDataSource<any>;

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

   /* Table Data and Column Definitions */
   defaultRowDef: Array<string> = ["text", "count"];
   POSrowDef: Array<string> = ["text", "count", "posCount"];
   rowDef: Array<string> = this.defaultRowDef;


   constructor(
     NavigationService: NavigationService,
     AnalysisService: AnalysisService,
     private dataProcessingService: DataProcessingService,
     private changeRef : ChangeDetectorRef,
     dialogService: DialogService,
     itemRepository: ItemRepository
     ) {
     super(
       NavigationService, AnalysisService,
       dialogService, itemRepository);
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
    if(this.sortField === property) {
      this.ascending = !this.ascending;
    } else {
      // Establish default sort order based on property
      switch(property) {
        case 'text':
          this.ascending = true;
          break;
        case 'count':
          this.ascending = false;
          break;
        default:
          break;
      }
    }
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

    this.termsDataSource = new MatTableDataSource(this.terms);
    this.displayedCount = this.terms.length;
  }

  toggleShowPOS(): void {
    this.showPOS = !this.showPOS;
    this.rowDef = this.showPOS ? this.POSrowDef : this.defaultRowDef;
  }
}
