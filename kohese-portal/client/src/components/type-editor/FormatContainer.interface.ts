import { PropertyDefinition } from './PropertyDefinition.interface';

export interface FormatContainer {
  kind: string;
  contents: Array<PropertyDefinition>;
}
