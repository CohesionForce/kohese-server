import * as ItemProxy from '../../../../common/src/item-proxy';
import { TypeProperty } from './TypeProperty.class';

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
  
  public synchronizeModels(): void {
    for (let fieldKey in this._fields) {
      let field: any = this._fields[fieldKey];
      if ('views' === fieldKey) {
        this.viewModelProxy.item.viewProperties[fieldKey] = field.views[
          'form'];
      } else if (this._dataModelProxy.item[fieldKey]) {
        this._dataModelProxy.item[fieldKey] = field;
      }
    }
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
