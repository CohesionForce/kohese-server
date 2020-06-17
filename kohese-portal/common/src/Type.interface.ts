export interface Type {
  typeKind?: TypeKind;
  name: string;
}

export enum TypeKind {
  KOHESE_MODEL = 'Kohese Model', ENUMERATION = 'Enumeration'
}
