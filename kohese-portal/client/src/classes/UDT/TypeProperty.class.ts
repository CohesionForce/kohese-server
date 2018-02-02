export class TypeProperty {
  inputType: any;
  required: boolean;
  enum : Array<string>;
  default : any;
  propertyName : string;

  constructor(property: any) {
    this.inputType = property.inputType;
    this.required = property.required
    this.default = property.default;
    this.propertyName = property.propertyName;
  }
}
