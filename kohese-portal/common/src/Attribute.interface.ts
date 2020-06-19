export interface Attribute {
  name: string;
  type: Array<string> | string;
  default: any;
  required: boolean;
  relation?: ContainmentReferenceSpecification |
    NonContainmentReferenceSpecification;
}

export interface ContainmentReferenceSpecification {
  contained: boolean;
}

export interface NonContainmentReferenceSpecification {
  type: string;
  foreignKey: string;
}

