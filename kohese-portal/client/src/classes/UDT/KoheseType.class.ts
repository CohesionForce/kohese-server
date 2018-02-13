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
        let type: string;
        let options: string = '{}';
        if (-1 !== delimiterIndex) {
          type = inputType.substring(0, delimiterIndex);
          options = inputType.substring(delimiterIndex + 1);
        } else {
          type = inputType;
        }

        userInputDefinition.inputType = {
          type: type,
          options: JSON.parse(options)
        };

        this.properties[property] = userInputDefinition;
      }
    }
  }
}