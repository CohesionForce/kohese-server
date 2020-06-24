import { Type } from './Type.interface';
import { FormatDefinition } from './FormatDefinition.interface';
import { TableDefinition } from './TableDefinition.interface';

export interface KoheseDataModel extends Type {
  base: string;
  idInjection: boolean;
  properties: any;
  validations: Array<any>;
  relations: any;
  acls: Array<any>;
  methods: Array<any>;
}

export interface KoheseViewModel extends Type {
  modelName: string;
  icon: string;
  color: string;
  viewProperties: { [attributeName: string]: any };
  formatDefinitions: { [formatDefinitionId: string]: FormatDefinition };
  defaultFormatKey: { [formatDefintionType: string]: string };
  tableDefinitions: { [tableDefinitionId: string]: TableDefinition };
}
