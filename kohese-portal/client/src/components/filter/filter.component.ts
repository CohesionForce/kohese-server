import { Component, ChangeDetectionStrategy, Optional, Inject,
  ChangeDetectorRef, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

import { DialogService } from '../../services/dialog/dialog.service';
import { Filter, FilterElement, FilterCriterion, FilterCriteriaConnection,
  FilterCriteriaConnectionType } from './filter.class';

@Component({
  selector: 'filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterComponent implements OnInit {
  get data() {
    return this._data;
  }
  
  private _filter: Filter;
  get filter() {
    return this._filter;
  }
  
  private _selectedElements: Array<FilterElement> = [];
  get selectedElements() {
    return this._selectedElements;
  }
  
  private _isTargetingForCopy: boolean = false;
  private _inTargetingMode: boolean = false;
  get inTargetingMode() {
    return this._inTargetingMode;
  }
  
  public constructor(@Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    private _changeDetectorRef: ChangeDetectorRef,
    private _dialogService: DialogService) {
  }
  
  public ngOnInit(): void {
    if (this._data) {
      this._filter = this._data.filter;
    }
    
    if (!this._filter) {
      this._filter = new Filter();
    }
  }
  
  public addCriterionToSelectedConnections(): void {
    for (let j: number = 0; j < this._selectedElements.length; j++) {
      let connection: FilterCriteriaConnection = (this.
        _selectedElements[j] as FilterCriteriaConnection);
      connection.criteria.push(FilterCriterion.getDefaultTrueCriterion(
        connection.depth + 1));
    }
    
    this._changeDetectorRef.markForCheck();
  }
  
  public addConnectionToSelectedConnections(): void {
    for (let j: number = 0; j < this._selectedElements.length; j++) {
      let connection: FilterCriteriaConnection = (this.
        _selectedElements[j] as FilterCriteriaConnection);
      connection.connections.push(new FilterCriteriaConnection(
        FilterCriteriaConnectionType.OR, connection.depth + 1));
    }
    
    this._changeDetectorRef.markForCheck();
  }
  
  public deleteSelectedElements(): void {
    for (let j: number = 0; j < this._selectedElements.length; j++) {
      let selectedElement: FilterElement = this._selectedElements[j];
      let shouldDelete: boolean = true;
      if ((selectedElement instanceof FilterCriteriaConnection) && (
        (selectedElement as FilterCriteriaConnection).criteria.length > 0) ||
        ((selectedElement as FilterCriteriaConnection).connections.length >
        0)) {
        this._dialogService.openYesNoDialog('Delete Elements Recursively',
          'Deleting this element should delete all descendants of this ' +
          'element also. Are you sure that you want to delete this element?').
          subscribe((response: any) => {
          shouldDelete = !!response;
        });
      }
      
      if (shouldDelete) {
        let elementStack: Array<FilterElement> = [this._filter.rootElement];
        searchLoop: while (elementStack.length > 0) {
          let connection: FilterCriteriaConnection = (elementStack.
            pop() as FilterCriteriaConnection);
          for (let j: number = 0; j < connection.criteria.length; j++) {
            if (selectedElement === connection.criteria[j]) {
              connection.criteria.splice(j, 1);
              break searchLoop;
            }
          }
          
          for (let j: number = 0; j < connection.connections.length; j++) {
            if (selectedElement === connection.connections[j]) {
              connection.connections.splice(j, 1);
              break searchLoop;
            } else {
              elementStack.push(connection.connections[j]);
            }
          }
        }
      }
    }
    
    this._selectedElements.length = 0;
    this._changeDetectorRef.markForCheck();
  }
  
  public enterCopyTargetingMode(): void {
    this._isTargetingForCopy = true;
    this._inTargetingMode = true;
    
    this._changeDetectorRef.markForCheck();
  }
  
  public enterMoveTargetingMode(): void {
    this._isTargetingForCopy = false;
    this._inTargetingMode = true;
    
    this._changeDetectorRef.markForCheck();
  }
  
  public exitTargetingMode(): void {
    this._inTargetingMode = false;
    
    this._changeDetectorRef.markForCheck();
  }
  
  public targetSelected(element: FilterElement): void {
    let connection: FilterCriteriaConnection =
      (element as FilterCriteriaConnection);
    for (let j: number = 0; j < this._selectedElements.length; j++) {
      let selectedElement: FilterElement = this._selectedElements[j];
      if (this._isTargetingForCopy) {
        selectedElement = JSON.parse(JSON.stringify(selectedElement));
      }
      
      if (selectedElement instanceof FilterCriterion) {
        connection.criteria.push(selectedElement as FilterCriterion);
      } else {
        connection.connections.push(
          selectedElement as FilterCriteriaConnection);
      }
    }
    
    this._inTargetingMode = false;
    this._changeDetectorRef.markForCheck();
  }
  
  public modifySelection(element: FilterElement): void {
    let index: number = this._selectedElements.indexOf(element);
    if (-1 === index) {
      this._selectedElements.push(element);
    } else {
      this._selectedElements.splice(index, 1);
    }
  }
  
  public areSelectedElementsCriteria(): boolean {
    let areCriteria: boolean = true;
    for (let j: number = 0; j < this._selectedElements.length; j++) {
      if (!(this._selectedElements[j] instanceof FilterCriterion)) {
        areCriteria = false;
        break;
      }
    }
    
    return areCriteria;
  }
  
  public areSelectedElementsConnections(): boolean {
    let areConnections: boolean = true;
    for (let j: number = 0; j < this._selectedElements.length; j++) {
      if (!(this._selectedElements[j] instanceof FilterCriteriaConnection)) {
        areConnections = false;
        break;
      }
    }
    
    return areConnections;
  }
}