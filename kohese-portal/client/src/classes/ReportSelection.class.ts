import { ItemProxy } from '../../../common/src/item-proxy';

export class ReportSelection {
  get itemProxy() {
    return this._itemProxy;
  }
  
  private _includeDescendants: boolean = true;
  get includeDescendants() {
    return this._includeDescendants;
  }
  set includeDescendants(includeDescendants: boolean) {
    this._includeDescendants = includeDescendants;
  }
  
  public constructor(private _itemProxy: ItemProxy) {
  }
}
