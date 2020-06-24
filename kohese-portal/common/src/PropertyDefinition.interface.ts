export interface PropertyDefinition {
  /* Change type to 'string' once Reverse Reference Table PropertyDefinitions
  are handled separately */
  propertyName: any;
  customLabel: string;
  labelOrientation: string;
  kind: string;
  formatDefinition?: string;
  tableDefinition?: string;
  visible: boolean;
  editable: boolean;
}
