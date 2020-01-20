export interface PropertyDefinition {
  propertyName: { kind: string, attribute: string };
  customLabel: string;
  labelOrientation: string;
  hideEmpty: boolean;
  kind: string;
  inputOptions: any;
  formatDefinition?: string;
  tableDefinition?: string;
}
