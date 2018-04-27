import { MockViewData } from './MockViewData';
import { MockDataModel } from './MockDataModel';
import { ItemProxy } from '../../../common/src/item-proxy';
import { KoheseModel } from '../../../common/src/KoheseModel';


export function MockKoheseType () {
  return {
  acls : [],
  base : ['PersistedModel'],
  dataModelProxy : new KoheseModel(MockDataModel()),
  description: "",
  icon: "fa fa-sticky-note",
  idInjection : true,
  methods : [],
  name : "Item",
  properties: {

  },
  relations: {

  },
  strict: null,
  trackChanges : null,
  validations : [],
  viewModelProxy : new ItemProxy('KoheseView', MockViewData()),
  dataModelFields : MockDataModel().properties
  }
}
