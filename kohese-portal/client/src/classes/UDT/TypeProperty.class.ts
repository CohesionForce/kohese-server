export class TypeProperty {
  inputType: any;
  required: boolean;
  enum : Array<string>;
  default : any;
  displayName : string;

  constructor(property: any) {
    this.inputType = property.inputType;
    this.required = property.required
    this.default = property.default;
    this.displayName = property.displayName;
  }
}
