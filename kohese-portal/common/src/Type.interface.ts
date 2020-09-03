export interface Type {
  metatype: Metatype;
  namespace?: { id: string };
  id: string;
  name: string;
  localTypes?: { [localTypeName: string]: Type };
}

export enum Metatype {
  STRUCTURE = 'Structure', ENUMERATION = 'Enumeration', VARIANT = 'Variant',
    NAMESPACE = 'Namespace'
}
