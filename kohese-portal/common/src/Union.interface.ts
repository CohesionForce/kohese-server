import { Type } from './Type.interface';
import { Attribute } from './Attribute.interface';

export interface Union extends Type {
  variantMemberMap: { [variantMemberName: string]: Attribute };
}
