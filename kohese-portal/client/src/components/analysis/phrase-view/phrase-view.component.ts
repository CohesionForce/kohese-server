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


//TODO - implement cross filter comm

@Component({
  selector: 'phrase-view',
  templateUrl : './phrase-view.component.html'
})
export class PhraseViewComponent extends AnalysisViewComponent
                                   implements OnInit, OnDestroy {
  /* UI Switches */
  private loadLimit: number = 100;
  private ascending: boolean = true;
  private sortField: string = 'count';
  private filters: Array<RegExp> = [];
  
  private phrases: Array<any> = [];
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
    
    this.processPhrases();
  }

  ngOnDestroy(): void {
    this.filterSubjectSubscription.unsubscribe();
  }

  getPhraseCount(): number {
    return $('#thePhrasesBody').find('tr').length;
  }
  
  sort(property: string): void {
    this.sortField === property ? (this.ascending = !this.ascending) : (this.ascending = true);
    this.sortField = property;
    this.processPhrases();
  }
  
  filter(f: RegExp): void {
    let index: number = this.filters.indexOf(f);
    if (-1 === index) {
      this.filters.push(f);
    } else {
      this.filters.splice(index, 1);
    }
    
    this.processPhrases();
  }
  
  processPhrases(): void {
    this.phrases = this.dataProcessingService.sort(
      this.dataProcessingService.filter(
      this.itemProxy.analysis.extendedChunkSummaryList, [(input: any) => {
        for (let j: number = 0; j < this.filters.length; j++) {
          if (!this.filters[j].test(input)) {
            return false;
          }
        }
        
        return true;
      }]), [this.sortField], this.ascending).slice(0, this.loadLimit);
  }
}
