import { TypeProperty } from './TypeProperty.class';
import * as ItemProxy from '../../../../common/models/item-proxy';

export class KoheseType {
  name : string;
  base : string;
  strict : string;
  idInjection : boolean;
  trackChanges : boolean;
  properties : Array<TypeProperty>
  validations : Array<any>
  relations : object;
  acls : Array<any>;
  methods : Array<any>;

  constructor(private typeProxy : ItemProxy) {
    this.name = typeProxy.item.name;
    this.base = typeProxy.item.base;
    this.strict = typeProxy.item.strict;
    this.idInjection = typeProxy.item.idInjection;
    this.trackChanges = typeProxy.item.trackChanges;
    this.validations = typeProxy.item.validations;
    this.relations = typeProxy.item.relations;
    this.acls = typeProxy.item.acls;
    this.methods = typeProxy.item.methods;
    console.log(this);
  }
}
