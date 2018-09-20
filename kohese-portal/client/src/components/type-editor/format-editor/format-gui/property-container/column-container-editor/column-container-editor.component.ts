import { PropertyDefinition } from './../../../format-editor.component';
import { KoheseType } from '../../../../../../classes/UDT/KoheseType.class';
import { FormatContainer } from '../../../format-editor.component';
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
  kind : KoheseType
  @Output()
  deleted = new EventEmitter();

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
      propertyName : '',
      hideLabel : false,
      labelOrientation: 'Top',
      kind :  '',
      hideEmpty : false
    })
  }


  removeContainer() {
    this.deleted.emit(this.container);
  }

  setFormat(numColumns : number) {
    this.container.numColumns = numColumns
    this.initColumns(this.container);
  }

}
