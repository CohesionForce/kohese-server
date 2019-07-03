export class PdfImportParameters {
  public forceTocStructuring: boolean = false;
  public doNotStructure: boolean = false;
  public matchSectionNamesLeniently: boolean = true;
  public moveFootnotes: boolean = false;
  public tocBeginning: number = 0;
  public tocEnding: number = 0;
  public tocEntryPadding: string;
  public headerLines: number = 2;
  public footerLines: number = 2;
  
  public constructor() {
  }
}
