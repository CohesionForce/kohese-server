import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject, OnInit, Input, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, Sort } from '@angular/material';

import { DialogService } from '../../services/dialog/dialog.service';
import { TreeComponent } from '../tree/tree.component';

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
  
  private _getName: (element: any) => string;
  get getName() {
    return this._getName;
  }
  @Input('getName')
  set getName(getName: (element: any) => string) {
    this._getName = getName;
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
  
  get matDialogRef() {
    return this._matDialogRef;
  }
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef: MatDialogRef<TableComponent>,
    private _dialogService: DialogService) {
  }
  
  public ngOnInit(): void {
    if (this.isDialogInstance()) {
      this._rows = this._data['rows'];
      this._getName = this._data['getName'];
      
      if (this._data['columns']) {
        this._columns = this._data['columns'];
      }
      
      this._add = this._data['add'];
      this._edit = this._data['edit'];
      this._move = this._data['move'];
      this._remove = this._data['remove'];
    }
    
    if (!this._columns) {
      this._columns = Object.keys(this._rows[0]);
      for (let j: number = 1; j < this._rows.length; j++) {
        let attributeNames: Array<string> = Object.keys(this._rows[j]);
        this._columns = this._columns.filter((attributeName: string) => {
          return (attributeNames.indexOf(attributeName) !== -1);
        });
      }
      
      let nameIndex: number = this._columns.indexOf('name');
      if (nameIndex !== -1) {
        this._columns.splice(nameIndex, 1);
      }
      
      this._columns.unshift('name');
    }
  }
  
  public isDialogInstance(): boolean {
    return this._matDialogRef && (this._matDialogRef.componentInstance ===
      this) && this._data;
  }
  
  public moveElements(elements: Array<any>): void {
    let selectedMoveLocation: string;
    let locations: Array<string> = ['Before', 'After'];
    this._dialogService.openComponentDialog(TreeComponent, {
      data: {
        root: undefined,
        getChildren: (element: any) => {
          if (element === undefined) {
            return this._rows.filter((rowElement: any) => {
              return (elements.indexOf(rowElement) === -1);
            });
          } else {
            return [];
          }
        },
        getText: (element: any) => {
          return this._getName(element);
        },
        elementSelectionHandler: (element: any) => {
          this._dialogService.openSelectDialog('Move Location', 'Please ' +
            'select a move location:', 'Move Location', locations[0],
            locations).afterClosed().subscribe((selectedLocation:
            string) => {
            if (selectedLocation) {
              selectedMoveLocation = selectedLocation;
            } else {
              selectedMoveLocation = locations[0];
            }
          });
        }
      },
      disableClose: true
    }).updateSize('80%', '80%').afterClosed().subscribe((selection:
      Array<any>) => {
      if (selection) {
        this._move(elements, selection[0], (selectedMoveLocation === locations[
          0]));
        for (let j: number = 0; j < elements.length; j++) {
          this._rows.splice(this._rows.indexOf(elements[j]), 1);
        }
        this._rows.splice(this._rows.indexOf(selection[0]) +
          ((selectedMoveLocation === locations[0]) ? 0 : 1), 0, ...elements);
        this._table.renderRows();
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public changeSelectionOfAll(select: boolean): void {
    this._selection.length = 0;
    if (select) {
      this._selection.push(...this._rows);
    }
    
    this._changeDetectorRef.markForCheck();
  }
  
  public sort(sortInformation: Sort): void {
    if (sortInformation.active === 'name') {
      this._rows.sort((oneElement: any, anotherElement: any) => {
        let comparison: number = this._getName(oneElement).localeCompare(this.
          _getName(anotherElement));
        return ((sortInformation.direction === 'desc') ? -comparison :
          comparison);
      });
    } else {
      this._rows.sort((oneElement: any, anotherElement: any) => {
        let comparison: number = String(oneElement[sortInformation.active]).
          localeCompare(String(anotherElement[sortInformation.active]));
        return ((sortInformation.direction === 'desc') ? -comparison :
          comparison);
      });
    }
    
    this._table.renderRows();
  }
  
  public toggleSelection(row: any): void {
    let index: number = this._selection.indexOf(row);
    if (index === -1) {
      this._selection.push(row);
    } else {
      this._selection.splice(index, 1);
    }
    
    this._changeDetectorRef.markForCheck();
  }
}

