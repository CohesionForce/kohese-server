export interface Type {
  metatype: Metatype;
  id: string;
  name: string;
  localTypes?: { [localTypeName: string]: Type };
}

export enum Metatype {
  STRUCTURE = 'Structure', ENUMERATION = 'Enumeration', VARIANT = 'Variant'
}
