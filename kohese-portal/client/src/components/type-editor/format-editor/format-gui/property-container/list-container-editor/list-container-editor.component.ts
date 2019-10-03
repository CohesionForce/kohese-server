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
  
  get Object() {
    return Object;
  }

  constructor() { }

  ngOnInit() {
    if(!this.container) {
      console.log('no container', this)
    }
    console.log(this);
  }

  addRow() {
    let model: any = this.kind.dataModelProxy.item;
    this.container.contents.push({
      propertyName : {
        kind: model.name,
        attribute: Object.keys(model.classProperties)[0]
      },
      hideLabel : false,
      labelOrientation: 'Top',
      kind :  '',
      hideEmpty : false,
      inputOptions : {}
    })
  }

  removeContainer() {
    this.deleted.emit(this.container);
  }

  deleteProperty(row) {
    let idx = this.container.contents.indexOf(row);
    this.container.contents.splice(idx, 1);
    console.log(this.container.contents);
  }

}
