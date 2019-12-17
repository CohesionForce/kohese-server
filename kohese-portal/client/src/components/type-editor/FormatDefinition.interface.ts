import { FormatContainer } from './FormatContainer.interface';

export interface FormatDefinition {
  id: string;
  name: string;
  header: FormatContainer;
  containers: Array<FormatContainer>;
}

export enum FormatDefinitionType {
  DOCUMENT = 'document', CARD = 'card'
}
