import { TypePropertyData } from './TypeProperty.data';

export class TypeProperty {
  inputType: string;
  required:boolean;
  enum : Array<string>;
  template : string;
  default : any;
  propertyName : string;

  constructor(typeName : string) {
    var typeData = TypePropertyData[typeName];
    this.inputType = typeData.type;
    this.template = typeData.template;
    this.required = typeData.required
    this.default = typeData.default;
    this.propertyName = typeData.propertyName;
  }
}
