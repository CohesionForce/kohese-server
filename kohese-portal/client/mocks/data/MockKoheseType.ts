import { MockViewData } from './MockViewData';
import { MockDataModel } from './MockDataModel';
import { ItemProxy } from '../../../common/src/item-proxy';

export function MockKoheseType () {
  return {
  acls : [],
  base : ['PersistedModel'],
  dataModelProxy : new ItemProxy('KoheseModel', MockDataModel()),
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
