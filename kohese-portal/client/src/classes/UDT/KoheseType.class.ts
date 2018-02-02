import * as ItemProxy from '../../../../common/models/item-proxy';
import { TypeProperty } from './TypeProperty.class';

export class KoheseType {
  name : string;
  private base : string;
  private strict : string;
  private idInjection : boolean;
  private trackChanges : boolean;
  properties: any = {};
  private validations : Array<any>
  private relations : object;
  private acls : Array<any>;
  private methods : Array<any>;

  constructor(private typeProxy : ItemProxy, private viewProxy: ItemProxy) {
    this.name = typeProxy.item.name;
    this.base = typeProxy.item.base;
    this.strict = typeProxy.item.strict;
    this.idInjection = typeProxy.item.idInjection;
    this.trackChanges = typeProxy.item.trackChanges;
    this.validations = typeProxy.item.validations;
    this.relations = typeProxy.item.relations;
    this.acls = typeProxy.item.acls;
    this.methods = typeProxy.item.methods;

    if (viewProxy) {
      for (let property in viewProxy.item.viewProperties) {
        let userInputDefinition: TypeProperty = viewProxy.item.viewProperties[property];
        let inputType: string = userInputDefinition.inputType;
        let delimiterIndex: number = inputType.indexOf(':');
        let t: string;
        let o: any = {};
        if (-1 !== delimiterIndex) {
          t = inputType.substring(0, delimiterIndex);
          o = inputType.substring(delimiterIndex + 1);
        } else {
          t = inputType;
        }
    
        userInputDefinition.inputType = {
          type: t,
          options: JSON.parse(o)
        };
        
        this.properties[property] = userInputDefinition;
      }
    }
  }
}
