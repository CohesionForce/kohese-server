import * as ItemProxy from '../../../../common/models/item-proxy';
import { TypeProperty } from './TypeProperty.class';

export class KoheseType {
  private dataModelProxy: ItemProxy;
  private viewModelProxy: ItemProxy;
  name : string;
  description: string;
  icon: string;
  base : string;
  private strict : string;
  private idInjection : boolean;
  private trackChanges : boolean;
  properties: any = {};
  private validations : Array<any>
  private relations : object;
  private acls : Array<any>;
  private methods : Array<any>;
  private _dataModelFields: any = {};
  get dataModelFields() {
    return this._dataModelFields;
  }

  constructor(dataModelProxy: ItemProxy, viewModelProxy: ItemProxy) {
    this.dataModelProxy = dataModelProxy;
    this.viewModelProxy = viewModelProxy;
    this.retrieveModelData();
    if (this.viewModelProxy) {
      this.retrieveViewData();
    }
  }
  
  retrieveModelData(): void {
    this.name = this.dataModelProxy.item.name;
    this.description = this.dataModelProxy.item.description;
    this.base = this.dataModelProxy.item.base;
    this.strict = this.dataModelProxy.item.strict;
    this.idInjection = this.dataModelProxy.item.idInjection;
    this.trackChanges = this.dataModelProxy.item.trackChanges;
    this.validations = this.dataModelProxy.item.validations;
    this.relations = this.dataModelProxy.item.relations;
    this.acls = this.dataModelProxy.item.acls;
    this.methods = this.dataModelProxy.item.methods;
    
    let fieldGroups: Array<any> = [];
    let modelProxy: ItemProxy = this.dataModelProxy;
    let hasBase: boolean = false;
    
    do {
      let modelFields: any = {};
      for (let fieldKey in modelProxy.item.properties) {
        modelFields[fieldKey] = modelProxy.item.
          properties[fieldKey];
      }
      fieldGroups.push(modelFields);
 
      hasBase = Object.hasOwnProperty(modelProxy.item.base);
      modelProxy = modelProxy.parent;
    } while (hasBase);
    
    fieldGroups.reverse();
    for (let j: number = 0; j < fieldGroups.length; j++) {
      for (let fieldKey in fieldGroups[j]) {
        this._dataModelFields[fieldKey] = fieldGroups[j][fieldKey];
      }
    }
  }
  
  retrieveViewData(): void {
    this.icon = this.viewModelProxy.item.icon;
    for (let property in this.viewModelProxy.item.viewProperties) {
      this.properties[property] = this.transformViewProperty(this.viewModelProxy.
        item.viewProperties[property]);
    }
  }
  
  synchronizeDataModel(): ItemProxy {
    this.dataModelProxy.item.name = this.name;
    this.dataModelProxy.item.description = this.description;
    this.dataModelProxy.item.base = this.base;
    this.dataModelProxy.item.strict = this.strict;
    this.dataModelProxy.item.idInjection = this.idInjection;
    this.dataModelProxy.item.trackChanges = this.trackChanges;
    this.dataModelProxy.item.validations = this.validations;
    this.dataModelProxy.item.relations = this.relations;
    this.dataModelProxy.item.acls = this.acls;
    this.dataModelProxy.item.methods = this.methods;
    
    return this.dataModelProxy;
  }
  
  synchronizeViewModel(): ItemProxy {
    this.viewModelProxy.item.icon = this.icon;
    for (let propertyId in this.properties) {
      let property: TypeProperty = this.properties[propertyId];
      property.inputType = property.inputType.type + ':' + JSON.stringify(
        property.inputType.options);
      this.viewModelProxy.item.viewProperties[propertyId] = property;
    }
    return this.viewModelProxy;
  }
  
  transformViewProperty(property: TypeProperty): any {
    let inputType: string = property.inputType;
    let delimiterIndex: number = inputType.indexOf(':');
    let type: string = inputType.substring(0, delimiterIndex);
    let options: string = inputType.substring(delimiterIndex + 1);

    property.inputType = {
      type: type,
      options: JSON.parse(options)
    };
    
    return property;
  }
  
  editProperty(id: string, property: TypeProperty): void {
    if (!id) {
      id = property.displayName;
    }
    this.properties[id] = this.transformViewProperty(property);
    this.retrieveViewData();
  }
  
  deleteProperty(id: string): void {
    delete this.properties[id];
  }
}
