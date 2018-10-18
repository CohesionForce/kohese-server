import { ColumnContainer } from './../../../../type-editor/format-editor/format-gui/property-container/column-container-editor/column-container-editor.component';
import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'column-container',
  templateUrl: './column-container.component.html',
  styleUrls: ['./column-container.component.scss']
})
export class ColumnContainerComponent implements OnInit {
  @Input()
  editable : boolean = false;
  @Input()
  columns : Array<ColumnContainer>;
  @Input()
  proxy
  @Input()
  numColumns : number;

  constructor() { }

  ngOnInit() {
  }

  stateChanged(stateName, value) {
    this.proxy.item[stateName] = value;
  }


}
