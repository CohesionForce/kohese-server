import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormatContainer } from '../../../../FormatContainer.interface';

@Component({
  selector: 'list-container-editor',
  templateUrl: './list-container-editor.component.html',
  styleUrls: ['./list-container-editor.component.scss']
})
export class ListContainerEditorComponent implements OnInit {
  @Input()
  container : FormatContainer;
  @Input()
  kind : any
  @Output()
  deleted : EventEmitter<any> = new EventEmitter()
  
  private _isDisabled: boolean = false;
  get isDisabled() {
    return this._isDisabled;
  }
  @Input('disabled')
  set isDisabled(isDisabled: boolean) {
    this._isDisabled = isDisabled;
  }
  
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
    this.container.contents.push({
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

  removeContainer() {
    this.deleted.emit(this.container);
  }

  deleteProperty(row) {
    let idx = this.container.contents.indexOf(row);
    this.container.contents.splice(idx, 1);
    console.log(this.container.contents);
  }

}
