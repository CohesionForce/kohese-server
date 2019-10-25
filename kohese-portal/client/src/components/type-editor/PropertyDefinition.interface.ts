export interface PropertyDefinition {
  propertyName: { kind: string, attribute: string };
  hideLabel: boolean;
  customLabel?: string;
  labelOrientation: string;
  hideEmpty: boolean;
  kind: string;
  inputOptions: any;
}
