import { KoheseType } from '../../../../../../classes/UDT/KoheseType.class';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormatContainer } from '../../../format-editor.component';

@Component({
  selector: 'list-container-editor',
  templateUrl: './list-container-editor.component.html',
  styleUrls: ['./list-container-editor.component.scss']
})
export class ListContainerEditorComponent implements OnInit {
  @Input()
  container : FormatContainer;
  @Input()
  kind : KoheseType
  @Output()
  deleted : EventEmitter<any> = new EventEmitter()

  constructor() { }

  ngOnInit() {
  }

  addRow() {
    this.container.contents.push({
      propertyName : '',
      hideLabel : false,
      labelOrientation: 'Top',
      kind :  ''
    })
  }

  removeContainer(row) {
    this.deleted.emit(this.container);
  }

  deleteProperty(row) {
    let idx = this.container.contents.indexOf(row);
    this.container.contents.splice(idx, 1);
    console.log(this.container.contents);
  }

}
