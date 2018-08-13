import { PropertyDefinition } from './../../../format-editor.component';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'property-row',
  templateUrl: './property-row.component.html',
  styleUrls: ['./property-row.component.scss']
})
export class PropertyRowComponent implements OnInit {
  @Input()
  property : PropertyDefinition;
  @Input()
  kind;
  console = console;
  @Input()
  disableDelete : boolean = false;

  @Output()
  deleted : EventEmitter<PropertyDefinition> = new EventEmitter();

  constructor() { }

  ngOnInit() {
    console.log(this.property)
  }

  deleteRow() {
    this.deleted.emit(this.property);
  }
}
