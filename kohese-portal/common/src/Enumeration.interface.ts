import { Type } from './Type.interface';

export interface Enumeration extends Type {
  values: Array<EnumerationValue>;
}

export interface EnumerationValue {
  name: string;
  description: string;
}

