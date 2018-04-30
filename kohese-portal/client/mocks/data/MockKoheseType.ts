import { MockViewData } from './MockViewData';
import { MockDataModel } from './MockDataModel';
import { ItemProxy } from '../../../common/src/item-proxy';
import { KoheseModel } from '../../../common/src/KoheseModel';


export function MockKoheseType () {
  let dataModelProxy: KoheseModel = new KoheseModel(MockDataModel());
  let viewModelProxy: ItemProxy = new ItemProxy('KoheseView', MockViewData());
  return {
    dataModelProxy : dataModelProxy,
    viewModelProxy : viewModelProxy,
    fields : MockDataModel().properties
  };
}
