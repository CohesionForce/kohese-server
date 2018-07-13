import { Component, ChangeDetectionStrategy, OnInit, Input, Output,
  EventEmitter, ChangeDetectorRef } from '@angular/core';

import { FilterElement, FilterCriterion,
  FilterCriteriaConnectionType } from './filter.class';

@Component({
  selector: 'filter-element',
  templateUrl: './filter-element.component.html',
  styleUrls: ['./filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterElementComponent implements OnInit {
  @Input()
  public element: FilterElement;
  @Input()
  public inTargetingMode: boolean;
  
  @Output()
  public targetSelected: EventEmitter<FilterElement> =
    new EventEmitter<FilterElement>();
  @Output()
  public elementSelected: EventEmitter<FilterElement> =
    new EventEmitter<FilterElement>();
  
  private _elementType: string;
  get elementType() {
    return this._elementType;
  }
  
  get CONDITIONS() {
    return FilterCriterion.CONDITIONS;
  }
  
  get FilterCriteriaConnectionType() {
    return FilterCriteriaConnectionType;
  }
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef) {
  }
  
  public ngOnInit(): void {
    if (this.element instanceof FilterCriterion) {
      this._elementType = 'FilterCriterion';
    } else {
      this._elementType = 'FilterCriteriaConnection';
    }
  }
  
  public getIndentationStyle(): object {
    return {
      'padding-left': this.element.depth * 30 + 'px'
    };
  }
}