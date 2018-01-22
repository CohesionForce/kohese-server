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

  }
}
