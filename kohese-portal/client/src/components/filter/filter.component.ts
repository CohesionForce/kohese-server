import { Component, ChangeDetectionStrategy, Optional, Inject,
  ChangeDetectorRef, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { KoheseType } from '../../classes/UDT/KoheseType.class';
import { Filter } from './filter.class';

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
  
  private _typeMap: any;
  get typeMap() {
    return this._typeMap;
  }
  
  public constructor(@Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    private _changeDetectorRef: ChangeDetectorRef,
    private _dynamicTypesService: DynamicTypesService) {
  }
  
  public ngOnInit(): void {
    if (this._data) {
      this._filter = this._data.filter;
    }
    
    if (!this._filter) {
      this._filter = new Filter();
    }
    
    this._typeMap = this._dynamicTypesService.getKoheseTypes();
  }
  
  public typeSelectionsChanged(selectedTypes: Array<string>): void {
    this._filter.types.length = 0;
    this._filter.properties.length = 0;
    for (let j: number = 0; j < selectedTypes.length; j++) {
      let koheseType: KoheseType = this._typeMap[selectedTypes[j]];
      this._filter.types.push(koheseType);
      this._filter.properties.push(...Object.keys(koheseType.dataModelProxy.
        item.properties));
    }
    
    this._changeDetectorRef.markForCheck();
  }
  
  public compareTypeOptionAndSelection(option: string, selection: KoheseType):
    boolean {
    return (this._typeMap[option] === selection);
  }
}