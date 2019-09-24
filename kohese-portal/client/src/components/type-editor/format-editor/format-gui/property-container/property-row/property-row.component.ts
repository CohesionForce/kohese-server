import { PropertyDefinition } from './../../../format-editor.component';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { DynamicTypesService } from '../../../../../../services/dynamic-types/dynamic-types.service';
import { TreeConfiguration } from '../../../../../../../../common/src/tree-configuration';

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
  disableDelete = false;
  @Input()
  container;

  @Output()
  deleted: EventEmitter<PropertyDefinition> = new EventEmitter();
  
  get Array() {
    return Array;
  }

  public constructor(private _dynamicTypesService: DynamicTypesService) {
  }

  ngOnInit() {
    if (!this.container) {
      console.log('no container', this);
    }
    console.log(this);
  }

  deleteRow() {
    this.deleted.emit(this.property);
  }

  updateKind(propertyName) {
    const viewProperty = this.kind.fields[propertyName.value].views.form;
    if (viewProperty) {
      this.property.inputOptions = viewProperty.inputType;
      console.log(viewProperty);
    } else {
      this.property.kind = 'read-only';
    }
    console.log(this.property.kind);
  }
  
  public getAttributes(): Array<any> {
    let attributes: Array<any> = [];
    let type: any = TreeConfiguration.getWorkingTree().getProxyFor(this.kind.
      dataModelProxy.item.name).item;
    let typeName: string = type.classProperties[this.property.propertyName].
      definition.type[0];
    for (let j: number = 0; j < type.localTypes.length; j++) {
      if (type.localTypes[j].name === typeName) {
        for (let attributeName in type.localTypes[j].properties) {
          let attribute: any = JSON.parse(JSON.stringify(type.localTypes[j].
            properties[attributeName]));
          attribute.name = attributeName;
          attributes.push(attribute);
        }
        
        break;
      }
    }
    
    if (attributes.length === 0) {
      let attributeMap: any = TreeConfiguration.getWorkingTree().getProxyFor(
        typeName).item.classProperties;
      for (let attributeName in attributeMap) {
        let attribute: any = JSON.parse(JSON.stringify(attributeMap[
          attributeName].definition));
        attribute.name = attributeName;
        attributes.push(attribute);
      }
    }
    
    return attributes;
  }
}
