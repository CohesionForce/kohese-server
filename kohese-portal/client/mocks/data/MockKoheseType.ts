import { MockViewData } from './MockViewData';
import { MockDataModel } from './MockDataModel';
import { ItemProxy } from '../../../common/src/item-proxy';
import { KoheseModel } from '../../../common/src/KoheseModel';


export function MockKoheseType () {
  let dataModelProxy: KoheseModel = new KoheseModel(MockDataModel());
  let viewModelProxy: ItemProxy = new ItemProxy('KoheseView', MockViewData());
  let properties: any = dataModelProxy.item.properties;
  for (let propertyId in properties) {
    let property: any = properties[propertyId];
    property.views = {};
    property.views['form'] = viewModelProxy.item.viewProperties[propertyId];
  }
  
  let koheseType: any = {
    dataModelProxy : dataModelProxy,
    viewModelProxy : viewModelProxy,
    fields: properties
  };
  dataModelProxy.type = koheseType;
  
  return koheseType;
}
