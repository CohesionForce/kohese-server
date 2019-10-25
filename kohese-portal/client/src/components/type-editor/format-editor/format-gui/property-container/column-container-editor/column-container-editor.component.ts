import { PropertyDefinition } from './../../../../PropertyDefinition.interface';
import { FormatContainer } from '../../../../FormatContainer.interface';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

export interface ColumnContainer extends FormatContainer {
  numColumns : number
  columns : Array<ColumnDefinition>
}

interface ColumnDefinition {
  contents : Array<PropertyDefinition>;
  index : number
}

@Component({
  selector: 'column-container-editor',
  templateUrl: './column-container-editor.component.html',
  styleUrls: ['./column-container-editor.component.scss']
})
export class ColumnContainerEditorComponent implements OnInit {
  @Input()
  container : ColumnContainer;
  @Input()
  kind : any
  @Output()
  deleted = new EventEmitter();
  
  private _isDisabled: boolean = false;
  get isDisabled() {
    return this._isDisabled;
  }
  @Input('disabled')
  set isDisabled(isDisabled: boolean) {
    this._isDisabled = isDisabled;
  }

  constructor() { }

  ngOnInit() {
    if (!this.container.numColumns) {
      this.container.numColumns = 2;
    }
    if (!this.container.columns) {
      this.initColumns(this.container);
    }
  }



  initColumns(container) {
    for (let idx = 0; idx < container.numColumns; idx++) {
      if (!this.container.columns) {
        this.container.columns = [];
      }
      if (!this.container.columns[idx]) {
        this.container.columns[idx] = {
          index : idx,
          contents : []
        }
      }
    }
  }

  addRow(rowNum : number) {
    this.container.columns[rowNum].contents.push({
      propertyName : {
        kind: this.kind.name,
        attribute: Object.keys(this.kind.classProperties)[0]
      },
      hideLabel : false,
      labelOrientation: 'Top',
      kind :  '',
      hideEmpty : false,
      inputOptions : {}
    })
  }

  public deleteProperty(columnIndex: number, propertyDefinition:
    PropertyDefinition): void {
    this.container.columns[columnIndex].contents.splice(this.container.columns[
      columnIndex].contents.indexOf(propertyDefinition), 1);
  }

  removeContainer() {
    this.deleted.emit(this.container);
  }

  setFormat(numColumns : number) {
    this.container.numColumns = numColumns
    this.initColumns(this.container);
  }

}
