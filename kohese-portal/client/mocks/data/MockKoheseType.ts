import { MockViewData } from './MockViewData';
import { MockDataModel } from './MockDataModel';
import { ItemProxy } from '../../../common/src/item-proxy';
import { KoheseModel } from '../../../common/src/KoheseModel';


export function MockKoheseType () {
  let dataModelProxy: KoheseModel = new KoheseModel(MockDataModel());
  let viewModelProxy: ItemProxy = new ItemProxy('KoheseView', MockViewData());
  return {
    acls : [],
    base : ['PersistedModel'],
    dataModelProxy : dataModelProxy,
    description: "",
    icon: "fa fa-sticky-note",
    idInjection : true,
    methods : [],
    name : "Item",
    properties: {},
    relations: {},
    strict: null,
    trackChanges : null,
    validations : [],
    viewModelProxy : viewModelProxy,
    dataModelFields : MockDataModel().properties,
    synchronizeDataModel: () => { return dataModelProxy; },
    synchronizeViewModel: () => { return viewModelProxy; }
  };
}
