import { MockViewData } from './MockViewData';
import { MockDataModel } from './MockDataModel';
import { ItemProxy } from '../../../common/src/item-proxy';
import { KoheseModel } from '../../../common/src/KoheseModel';


export function MockKoheseType () {
  let dataModelProxy: KoheseModel = ItemProxy.getWorkingTree().getProxyFor('Item') as KoheseModel
  
  return dataModelProxy.type;
}
