export class TypeProperty {
  type: string;
  required:boolean;
  enum : Array<string>;
  format : string;
  default : any;

  constructor(options : {
    type: string,
    enum? : Array<string>,
    required?: boolean,
    format?: string,
    default : any;
  }) {
    this.type = options.type;
    this.required = options.required || false;
    this.format = options.format || 'text';
    this.default = options.default;
  }
}
