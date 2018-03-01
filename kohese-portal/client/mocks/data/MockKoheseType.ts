import { MockViewData } from './MockViewData';
import { MockDataModel } from './MockDataModel';

export function MockKoheseType () {
  return {
  acls : [],
  base : ['PersistedModel'],
  dataModelProxy : MockDataModel,
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
  viewModelProxy : MockViewData
  }
}