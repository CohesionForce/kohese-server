import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject, OnInit, Input, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, Sort } from '@angular/material';

@Component({
  selector: 'table_',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent implements OnInit {
  private _rows: Array<any>;
  get rows() {
    return this._rows;
  }
  @Input('rows')
  set rows(rows: Array<any>) {
    this._rows = rows;
  }
  
  private _columns: Array<string>;
  get columns() {
    return this._columns;
  }
  @Input('columns')
  set columns(columns: Array<string>) {
    this._columns = columns;
  }
  
  private _selection: Array<any> = [];
  get selection() {
    return this._selection;
  }
  
  private _add: () => Promise<Array<any>>;
  get add() {
    if (this._add) {
      return async () => {
        this._rows = await this._add();
        this._table.renderRows();
        this._changeDetectorRef.markForCheck();
        return this._rows;
      };
    } else {
      return undefined;
    }
  }
  @Input('add')
  set add(add: () => Promise<Array<any>>) {
    this._add = add;
  }
  
  private _edit: (element: any) => void;
  get edit() {
    if (this._edit) {
      return (element: any) => {
        this._edit(element);
        this._table.renderRows();
        this._changeDetectorRef.markForCheck();
      };
    } else {
      return undefined;
    }
  }
  @Input('edit')
  set edit(edit: (element: any) => void) {
    this._edit = edit;
  }
  
  private _move: (elements: Array<any>, referenceElement: any, moveBefore:
    boolean) => void;
  get move() {
    return this._move;
  }
  @Input('move')
  set move(move: (elements: Array<any>, referenceElement: any, moveBefore:
    boolean) => void) {
    this._move = move;
  }
  
  private _remove: (elements: Array<any>) => void;
  get remove() {
    if (this._remove) {
      return (elements: Array<any>) => {
        this._remove(elements);
        for (let j: number = 0; j < elements.length; j++) {
          this._rows.splice(this._rows.indexOf(elements[j]), 1);
          this._selection.splice(this._selection.indexOf(elements[j]), 1);
        }
        this._table.renderRows();
        this._changeDetectorRef.markForCheck();
      };
    } else {
      return undefined;
    }
  }
  @Input('remove')
  set remove(remove: (elements: Array<any>) => void) {
    this._remove = remove;
  }
  
  private _isDisabled: boolean = false;
  get isDisabled() {
    return this._isDisabled;
  }
  @Input('disabled')
  set isDisabled(isDisabled: boolean) {
    this._isDisabled = isDisabled;
  }
  
  @ViewChild('table')
  private _table: any;
  
  get changeDetectorRef() {
    return this._changeDetectorRef;
  }
  
  get matDialogRef() {
    return this._matDialogRef;
  }
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef: MatDialogRef<TableComponent>) {
  }
  
  public ngOnInit(): void {
    if (this.isDialogInstance()) {
      this.rows = this._data['rows'];
      
      if (this._data['columns']) {
        this.columns = this._data['columns'];
      }
      
      this.add = this._data['add'];
      this.edit = this._data['edit'];
      this.move = this._data['move'];
      this.remove = this._data['remove'];
    }
    
    if (!this._columns) {
      this._columns = Object.keys(this._rows[0]);
      for (let j: number = 1; j < this._rows.length; j++) {
        let attributeNames: Array<string> = Object.keys(this._rows[j]);
        this._columns = this._columns.filter((attributeName: string) => {
          return (attributeNames.indexOf(attributeName) !== -1);
        });
      }
    }
    
    let concatenatedColumnNames: string = this._columns.join();
    this._columns.unshift(concatenatedColumnNames + 'selection');
    this._columns.push(concatenatedColumnNames + 'menu');
  }
  
  public isDialogInstance(): boolean {
    return this._matDialogRef && (this._matDialogRef.componentInstance ===
      this) && this._data;
  }
  
  public sort(sortInformation: Sort): void {
    this._rows.sort((oneElement: any, anotherElement: any) => {
      let comparison: number = String(oneElement[sortInformation.active]).
        localeCompare(String(anotherElement[sortInformation.active]));
      return ((sortInformation.direction === 'desc') ? -comparison :
        comparison);
    });
    
    this._table.renderRows();
  }
  
  public toggleAllSelected(select: boolean): void {
    this._selection.length = 0;
    if (select) {
      this._selection.push(...this._rows);
    }
  }
  
  public toggleSelected(row: any): void {
    let index: number = this._selection.indexOf(row);
    if (index === -1) {
      this._selection.push(row);
    } else {
      this._selection.splice(index, 1);
    }
  }
  
  public getMoveDataTransferValue(row: any): string {
    if (this._selection.length > 0) {
      let indices: Array<number> = this._selection.map((element: any) => {
        return this._rows.indexOf(element);
      });
      if (this._selection.indexOf(row) === -1) {
        indices.push(this._rows.indexOf(row));
      }
      
      indices.sort();
      return JSON.stringify(indices);
    } else {
      return JSON.stringify([this._rows.indexOf(row)]);
    }
  }
  
  public getRowsFromDataTransfer(dataTransferValue: string): Array<any> {
    let indices: Array<number> = JSON.parse(dataTransferValue);
    return indices.map((index: number) => {
      return this._rows[index];
    });
  }
}
