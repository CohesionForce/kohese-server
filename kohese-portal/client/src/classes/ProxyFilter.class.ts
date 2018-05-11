import { KoheseType } from './UDT/KoheseType.class';

export class ProxyFilter {
  actionAssignee: string = '';
  actionState: string = '';
  dirty: boolean = false;
  kind: KoheseType;
  status: boolean = false; // This seems wrong
  filterString: string = '';
  textRegexHighlight: RegExp;
  private _invalidRegex: boolean = false;
  get invalidRegex() {
    return this._invalidRegex;
  }
  set invalidRegex(invalidRegex: boolean) {
    this._invalidRegex = invalidRegex;
  }

  constructor() {
  }
}
