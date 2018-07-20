import { Component, ChangeDetectionStrategy, Optional, Inject,
  ChangeDetectorRef, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Filter, FilterCriteriaConnection } from './filter.class';

@Component({
  selector: 'filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterComponent implements OnInit {
  get data() {
    return this._data;
  }
  
  private _filterSubject: BehaviorSubject<Filter>;
  get filterSubject() {
    return this._filterSubject;
  }
  
  public constructor(@Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    private _changeDetectorRef: ChangeDetectorRef) {
  }
  
  public ngOnInit(): void {
    let filter: Filter;
    if (this._data) {
      filter = this._data.filter;
    }
    
    if (!filter) {
      filter = new Filter();
    }
    
    this._filterSubject = new BehaviorSubject<Filter>(filter);
  }
  
  public isCriterionDefined(): boolean {
    let criterionFound: boolean = false;
    let elementStack: Array<FilterCriteriaConnection> = [this._filterSubject.
      getValue().rootElement];
    while (elementStack.length > 0) {
      let connection: FilterCriteriaConnection = elementStack.pop();
      if (connection.criteria.length > 0) {
        criterionFound = true;
        break;
      } else {
        elementStack.push(...connection.connections);
      }
    }
    
    return criterionFound;
  }
}