import { PropertyDefinition } from './PropertyDefinition.interface';

export interface FormatContainer {
  kind: FormatContainerKind;
  contents: Array<PropertyDefinition>;
}

export enum FormatContainerKind {
  HEADER = 'header', VERTICAL = 'list', HORIZONTAL = 'column',
    REVERSE_REFERENCE_TABLE = 'ReverseReferenceTable'
}
