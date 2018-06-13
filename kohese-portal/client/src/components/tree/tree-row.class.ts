import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export class TreeRow {
  get object() {
    return this._object;
  }
  
  get text() {
    return this._text;
  }
  set text(text: string) {
    this._text = text;
  }
  
  get icon() {
    return this._icon;
  }
  set icon(icon: string) {
    this._icon = icon;
  }
  
  private _expanded: boolean = false;
  get expanded() {
    return this._expanded;
  }
  set expanded(expanded: boolean) {
    this._expanded = expanded;
  }
  
  private _visible: boolean = true;
  get visible() {
    return this._visible;
  }
  set visible(visible: boolean) {
    this._visible = visible;
  }
  
  private _matchesFilter: boolean = false;
  get matchesFilter() {
    return this._matchesFilter;
  }
  set matchesFilter(matchesFilter: boolean) {
    this._matchesFilter = matchesFilter;
  }
  
  private _depth: number = 0;
  get depth() {
    return this._depth;
  }
  set depth(depth: number) {
    this._depth = depth;
  }
  
  private _path: Array<string> = [];
  get path() {
    return this._path;
  }
  
  private _updateVisibleRows: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  get updateVisibleRows() {
    return this._updateVisibleRows;
  }
  
  public constructor(protected _object: any, private _text: string,
    private _icon: string) {
  }
  
  public isRowSelected(): boolean {
    // May be implemented externally
    return false;
  }
  
  public rowSelected(): void {
    // May be implemented externally
  }
  
  public isRowRoot(): boolean {
    // May be implemented externally
    return false;
  }
  
  public setRowAsRoot(): void {
    // May be implemented externally
  }
  
  public hasChildren(): boolean {
    // May be implemented externally
    return false;
  }
  
  public refresh(): void {
    // May be implemented externally
  }
}
