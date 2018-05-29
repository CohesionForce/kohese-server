import { ItemProxy } from '../../../../common/src/item-proxy';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export class TreeRow {
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
  
  get itemProxy() {
    return this._itemProxy;
  }
  private _updateDisplay: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  get updateDisplay() {
    return this._updateDisplay;
  }
  private _updateVisibleRows: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  get updateVisibleRows() {
    return this._updateVisibleRows;
  }
  
  private _depth: number = 0;
  get depth() {
    return this._depth;
  }
  set depth(depth: number) {
    this._depth = depth;
  }
  
  public constructor(private _itemProxy: ItemProxy) {
  }
  
  public getRowParentProxy(): ItemProxy {
    return this._itemProxy.parentProxy;
  }
  public getRowChildrenProxies(): Array<ItemProxy> {
    return this._itemProxy.children;
  }
}
