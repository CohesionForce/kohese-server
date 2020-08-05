export interface Attribute {
  name: string;
  type: Array<string> | string;
  default: any;
  required: boolean;
  relation?: ContainmentReferenceSpecification |
    NonContainmentReferenceSpecification;
  id?: boolean;
  properties?: any;
}

export interface ContainmentReferenceSpecification {
  contained: boolean;
}

export interface NonContainmentReferenceSpecification {
  kind: string;
  foreignKey: string;
}
