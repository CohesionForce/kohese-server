export interface Type {
  typeKind: TypeKind;
  id: string;
  name: string;
  localTypes?: { [localTypeName: string]: Type };
}

export enum TypeKind {
  KOHESE_MODEL = 'Kohese Model', ENUMERATION = 'Enumeration', VARIANT = 'Variant'
}
