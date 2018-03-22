import { ProxyFilter } from '../../classes/ProxyFilter.class';
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
  private _matchesFilter: boolean = true;
  get matchesFilter() {
    return this._matchesFilter;
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
  
  public constructor(private _itemProxy: ItemProxy) {
  }
  
  public filter(proxyFilter: ProxyFilter): void {
    let show: boolean = true;
    if (proxyFilter.filterString || proxyFilter.kind || proxyFilter.status ||
      proxyFilter.dirty || proxyFilter.status) {
      this._matchesFilter = this.doesProxyMatchFilter(this._itemProxy,
        proxyFilter, false);
      show = this._matchesFilter;
      if (!show) {
        for (let j: number = 0; j < this._itemProxy.children.length; j++) {
          if (this.doesProxyMatchFilter(this._itemProxy.children[j],
            proxyFilter, true)) {
            show = true;
            break;
          }
        }
      }
    } else {
      this._matchesFilter = false;
      proxyFilter.textRegexHighlight = null;
    }
    
    /* Expand tree-rows that have version control system changes to one or more
    children */
    if (proxyFilter.status && show) {
      this._expanded = true;
    }
    
    if (show !== this._visible) {
      this._visible = show;
    }
  }
  
  private doesProxyMatchFilter(proxy: ItemProxy, proxyFilter: ProxyFilter,
    checkChildren: boolean): boolean {
    let matches: boolean = true;
    if (proxyFilter.status && (!proxy.status ||
      (proxy.status.length === 0))) {
      matches = false;
    } else if (proxyFilter.dirty && !proxy.dirty) {
      matches =  false;
    } else if (proxyFilter.kind) {
      if (proxy.kind !== proxyFilter.kind.name) {
        matches = false;
      } else if (proxy.kind === 'Action') {
        if (proxyFilter.actionState && (proxy.item.actionState !==
          proxyFilter.actionState)) {
          matches = false;
        } else if (proxyFilter.actionAssignee && (proxy.item.assignedTo !==
          proxyFilter.actionAssignee)) {
          matches = false;
        }
      }
    }
    
    if (matches) {
      matches = false;
      let filterExpression: RegExp;
      let filterIsRegex: Array<string> = proxyFilter.filterString.
        match(new RegExp('^\/(.*)\/([gimy]*)$'));
      if (filterIsRegex) {
        filterExpression = new RegExp(filterIsRegex[1], filterIsRegex[2]);
        proxyFilter.textRegexHighlight = new RegExp('(' + filterIsRegex[1]
          + ')', 'g' + filterIsRegex[2]);
      } else {
        let cleanedPhrase: string = proxyFilter.filterString.
          replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filterExpression = new RegExp(proxyFilter.filterString, 'i');
        proxyFilter.textRegexHighlight = new RegExp('(' + cleanedPhrase
          + ')', 'gi');
      }
       
      for (let key in proxy.item) {
        if (key.charAt(0) !== '$' &&
          (typeof proxy.item[key] === 'string') &&
          proxy.item[key].match(filterExpression)) {
          matches = true;
          break;
        }
      }
    }
    
    if (!matches && checkChildren) {
      for (let j: number = 0; j < proxy.children.length; j++) {
        if (this.doesProxyMatchFilter(proxy.children[j], proxyFilter, true)) {
          matches = true;
          break;
        }
      }
    }
    
    return matches;
  }
}
