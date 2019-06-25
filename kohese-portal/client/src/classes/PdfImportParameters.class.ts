export class PdfImportParameters {
  private _forceTocStructuring: boolean = false;
  get forceTocStructuring() {
    return this._forceTocStructuring;
  }
  set forceTocStructuring(forceTocStructuring: boolean) {
    this._forceTocStructuring = forceTocStructuring;
  }
  
  private _doNotStructure: boolean = false;
  get doNotStructure() {
    return this._doNotStructure;
  }
  set doNotStructure(doNotStructure: boolean) {
    this._doNotStructure = doNotStructure;
  }
  
  private _matchSectionNamesLeniently: boolean = true;
  get matchSectionNamesLeniently() {
    return this._matchSectionNamesLeniently;
  }
  set matchSectionNamesLeniently(matchSectionNamesLeniently: boolean) {
    this._matchSectionNamesLeniently = matchSectionNamesLeniently;
  }
  
  private _moveFootnotes: boolean = false;
  get moveFootnotes() {
    return this._moveFootnotes;
  }
  set moveFootnotes(moveFootnotes: boolean) {
    this._moveFootnotes = moveFootnotes;
  }
  
  private _tocBeginning: number = 0;
  get tocBeginning() {
    return this._tocBeginning;
  }
  set tocBeginning(tocBeginning: number) {
    this._tocBeginning = tocBeginning;
  }
  
  private _tocEnding: number = 0;
  get tocEnding() {
    return this._tocEnding;
  }
  set tocEnding(tocEnding: number) {
    this._tocEnding = tocEnding;
  }
  
  private _tocEntryPadding: string;
  get tocEntryPadding() {
    return this._tocEntryPadding;
  }
  set tocEntryPadding(tocEntryPadding: string) {
    this._tocEntryPadding = tocEntryPadding;
  }
  
  private _headerLines: number = 2;
  get headerLines() {
    return this._headerLines;
  }
  set headerLines(headerLines: number) {
    this._headerLines = headerLines;
  }
  
  private _footerLines: number = 2;
  get footerLines() {
    return this._footerLines;
  }
  set footerLines(footerLines: number) {
    this._footerLines = footerLines;
  }
  
  public constructor() {
  }
}
