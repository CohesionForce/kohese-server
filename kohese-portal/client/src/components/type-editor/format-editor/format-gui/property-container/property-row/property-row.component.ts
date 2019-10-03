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
  
  private _attribute: any;
  get attribute() {
    return this._attribute;
  }
  
  private _attributeNames: any = {};
  get attributeNames() {
    return this._attributeNames;
  }

  @Output()
  deleted: EventEmitter<PropertyDefinition> = new EventEmitter();
  
  get Object() {
    return Object;
  }
  
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
    
    // Migration code
    if (typeof this.property.propertyName === 'string') {
      this.property.propertyName = {
        kind: this.kind.dataModelProxy.item.name,
        attribute: this.property.propertyName
      };
    }
    
    this._attribute = TreeConfiguration.getWorkingTree().getProxyFor(
      this.property.propertyName.kind).item.classProperties[this.property.
      propertyName.attribute].definition;
    
    this._attributeNames[this.kind.dataModelProxy.item.name] = Object.keys(
      this.kind.dataModelProxy.item.classProperties);
    for (let kindName in this._dynamicTypesService.getKoheseTypes()) {
      if (kindName !== this.kind.dataModelProxy.item.name) {
        let model: any = this._dynamicTypesService.getKoheseTypes()[kindName].
          dataModelProxy.item;
        let referenceAttributes: Array<any> = model.relationProperties;
        for (let j: number = 0; j < referenceAttributes.length; j++) {
          if (Array.isArray(model.classProperties[referenceAttributes[j]].
            definition.type)) {
            if (!this._attributeNames[kindName]) {
              this._attributeNames[kindName] = [];
            }
            
            this._attributeNames[kindName].push(referenceAttributes[j]);
          }
        }
      }
    }
  }

  deleteRow() {
    this.deleted.emit(this.property);
  }

  public updateKind(attributeObject: { kind: string, attribute: string }):
    void {
    this.property.hideLabel = false;
    this.property.customLabel = '';
    this.property.labelOrientation = 'Top';
    this.property.hideEmpty = false;
    if (attributeObject.kind === this.kind.dataModelProxy.item.name) {
      const viewProperty = TreeConfiguration.getWorkingTree().getProxyFor(
        'view-' + attributeObject.kind.toLowerCase()).item.viewProperties[
        attributeObject.attribute];
      if (viewProperty) {
        this.property.inputOptions = viewProperty.inputType;
        console.log(viewProperty);
      } else {
        this.property.kind = 'read-only';
      }
      delete this.property['tableDefinition'];
    } else {
      this.property.inputOptions = null;
      this.property.kind = '';
      this.property['tableDefinition'] = {
        columns: [ 'name', 'createdBy' ],
        expandedFormat: {
          column1: [],
          column2: [],
          column3: [],
          column4: []
        }
      };
    }
    
    this._attribute = TreeConfiguration.getWorkingTree().getProxyFor(
      attributeObject.kind).item.classProperties[attributeObject.attribute].
      definition;
    
    console.log(this.property.kind);
  }
  
  public areSameAttribute(option: { kind: string, attribute: string },
    selection: { kind: string, attribute: string }): boolean {
    return ((option.kind === selection.kind) && (option.attribute ===
      selection.attribute));
  }
  
  public getAttributes(): Array<any> {
    let attributes: Array<any> = [];
    let type: any = TreeConfiguration.getWorkingTree().getProxyFor(this.
      property.propertyName.kind).item;
    let typeName: string = this._attribute.type[0];
    if (type.name === this.kind.dataModelProxy.item.name) {
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
