import * as ItemProxy from '../../../../common/src/item-proxy';

export class KoheseType {
  get dataModelProxy() {
    return this._dataModelProxy;
  }
  
  get viewModelProxy() {
    return this._viewModelProxyMap[this._dataModelProxy.item.id];
  }
  
  private _fields: any = {};
  get fields() {
    return this._fields;
  }

  public constructor(private _dataModelProxy: ItemProxy,
    private _viewModelProxyMap: any) {
    this.compileFields();
  }
  
  public addProperty(propertyId: string): void {
    let property: any = {
      type: 'boolean',
      required: false,
      relation: false
    };
    let viewProperty: any = {
      displayName: propertyId,
      inputType: {
        type: '',
        options: {}
      }
    };
    let combinedProperty: any = JSON.parse(JSON.stringify(property));
    combinedProperty.views = {};
    this._dataModelProxy.item.properties[propertyId] = property;
    if (this.viewModelProxy) {
      this.viewModelProxy.item.viewProperties[propertyId] = viewProperty;
      combinedProperty.views['form'] = JSON.parse(JSON.stringify(viewProperty));
    }
    this._fields[propertyId] = combinedProperty;
  }
  
  public deleteProperty(propertyId: string): void {
    delete this._dataModelProxy.item.properties[propertyId];
    if (this.viewModelProxy) {
      delete this.viewModelProxy.item.viewProperties[propertyId];
    }
    delete this._fields[propertyId];
  }
  
  private compileFields(): void {
    let fieldGroups: Array<any> = [];
    let modelProxy: ItemProxy = this._dataModelProxy;
    
    do {
      let modelFields: any = {};
      for (let fieldKey in modelProxy.item.properties) {
        let field: any = JSON.parse(JSON.stringify(modelProxy.item.
          properties[fieldKey]));
        field.views = {};
        if (this.viewModelProxy) {
          let viewProperty: any = this.viewModelProxy.item.viewProperties[
            fieldKey];
          if (viewProperty) {
            field.views['form'] = JSON.parse(JSON.
              stringify(viewProperty));
          }
        }
        
        modelFields[fieldKey] = field;
      }
      fieldGroups.push(modelFields);
 
      modelProxy = modelProxy.parentProxy;
    } while (modelProxy.item.base);
    
    fieldGroups.reverse();
    for (let j: number = 0; j < fieldGroups.length; j++) {
      for (let fieldKey in fieldGroups[j]) {
        this._fields[fieldKey] = fieldGroups[j][fieldKey];
      }
    }
  }
}
