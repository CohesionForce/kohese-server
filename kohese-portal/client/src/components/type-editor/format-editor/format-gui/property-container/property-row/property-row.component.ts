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
  @Input()
  container;

  @Output()
  deleted : EventEmitter<PropertyDefinition> = new EventEmitter();

  constructor() { }

  ngOnInit() {
    if (!this.container) {
      console.log('no container', this)
    }
  }

  deleteRow() {
    this.deleted.emit(this.property);
  }

  updateKind(propertyName) {
    const viewProperty = this.kind.fields[propertyName.value].views.form;
    if (viewProperty) {
      if (viewProperty.inputType.options.asTable) {
        this.property.kind = 'table';
      } else {
        this.property.kind = viewProperty.inputType.type;
      }
      this.property.inputOptions = viewProperty.inputType;
      console.log(viewProperty);
    } else {
      this.property.kind = 'read-only';
    }
    console.log(this.property.kind);
  }
}
