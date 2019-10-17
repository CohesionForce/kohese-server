import { PropertyDefinition } from './../../../format-editor.component';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { DynamicTypesService } from '../../../../../../services/dynamic-types/dynamic-types.service';
import { TableDefinition } from '../../../../TableDefinition.interface';
import { ItemProxy } from '../../../../../../../../common/src/item-proxy';
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
  
  private _tableDefinitions: Array<TableDefinition>;
  get tableDefinitions() {
    return this._tableDefinitions;
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
        let model: any = this._dynamicTypesService.getKoheseTypes()[
          kindName].dataModelProxy.item;
        let referenceAttributes: Array<any> = model.relationProperties;
        for (let j: number = 0; j < referenceAttributes.length; j++) {
          let attributeType: any = model.classProperties[referenceAttributes[
            j]].definition.type;
          if (Array.isArray(attributeType)) {
            let viewModelProxy: ItemProxy = TreeConfiguration.
              getWorkingTree().getProxyFor('view-' + attributeType[0].
              toLowerCase());
            if (viewModelProxy && (Object.keys(viewModelProxy.item.
              tableDefinitions).length > 0)) {
              if (!this._attributeNames[kindName]) {
                this._attributeNames[kindName] = [];
              }
              
              this._attributeNames[kindName].push(referenceAttributes[j]);
            }
          }
        }
      }
    }
    
    if (this._attribute.relation && Array.isArray(this._attribute.type)) {
      this._tableDefinitions = Object.values(TreeConfiguration.
        getWorkingTree().getProxyFor('view-' + this._attribute.type[0].
        toLowerCase()).item.tableDefinitions);
    }
  }

  deleteRow() {
    this.deleted.emit(this.property);
  }

  public updateKind(attributeObject: { kind: string, attribute: string }):
    void {
    this._attribute = TreeConfiguration.getWorkingTree().getProxyFor(
      attributeObject.kind).item.classProperties[attributeObject.attribute].
      definition;
    
    if (this._attribute.relation && Array.isArray(this._attribute.type)) {
      this._tableDefinitions = Object.values(TreeConfiguration.
        getWorkingTree().getProxyFor('view-' + this._attribute.type[0].
        toLowerCase()).item.tableDefinitions);
    }
    
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
      this.property['tableDefinition'] = this._tableDefinitions[0].id;
    }
    
    console.log(this.property.kind);
  }
  
  public areSameAttribute(option: { kind: string, attribute: string },
    selection: { kind: string, attribute: string }): boolean {
    return ((option.kind === selection.kind) && (option.attribute ===
      selection.attribute));
  }
}
