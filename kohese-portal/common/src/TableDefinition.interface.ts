export interface TableDefinition {
  id: string;
  name: string;
  columns: Array<string>;
  expandedFormat: {
    column1: Array<string>,
    column2: Array<string>,
    column3: Array<string>,
    column4: Array<string>
  };
}
