import { Injectable } from '@angular/core';
import { NavigatableComponent } from './NavigationComponent.class';
import { NavigationService } from '../services/navigation/navigation.service';
import { Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ProxyFilter } from './ProxyFilter.class';
import { ItemProxy } from '../../../common/models/item-proxy.js';


export class RowComponent extends NavigatableComponent {
  @Input()
  protected itemProxy: ItemProxy;
  @Input()
  exactFilter : boolean // TODO - Implement exact Passing
  @Input()
  filterSubject : BehaviorSubject<ProxyFilter>
  private collapsed: boolean = true;

  previouslyExpanded : object;
  filter : ProxyFilter;

  constructor (protected NavigationService : NavigationService) {
    super (NavigationService);
  }

  initialize(): void {
    this.filterSubject.subscribe(filter => { this.filter = filter });
    this.previouslyExpanded = {};
    console.log(this);
  }
  
  getProxy(): ItemProxy {
    return this.itemProxy;
  }

  rowSelected ( ) {
    console.log('Row Selected'); // TODO - Reimplement
  }

  expandMatchingChildren(itemProxy: ItemProxy): void {
    var childrenList = itemProxy.children;
    this.collapsed[itemProxy.item.id] = false;
    for (var i = 0; i < childrenList.length; i++) {
      var proxy = childrenList[i];
      if (this.proxyOrChildMatchesFilter(proxy)) {
        this.expandMatchingChildren(proxy);
      }
    }
  }

  proxyOrChildMatchesFilter (proxy) {
    return this.matchesFilter(proxy) || this.childMatchesFilter(proxy);
  }

  childMatchesFilter (proxy : ItemProxy) {
    for (var childIdx = 0; childIdx < proxy.children.length; childIdx++) {
      var childProxy = proxy.children[childIdx];
      if (this.matchesFilter(childProxy) || this.childMatchesFilter(childProxy)) {
        // exit as soon as the first matching descendant is found
        return true;
      }
    }
    // no descendant found
    return false;
  }

  matchesFilter(proxy: ItemProxy) {
    if (this.filter.textRegex === null && !this.filter.kind && !this.filter.status && !this.filter.dirty) {
      return !this.exactFilter;
    } else {
      if (this.filter.status && (!proxy.status || proxy.status && proxy.status.length === 0)) {
        return false;
      }
      if (this.filter.dirty && !proxy.dirty) {
        return false;
      }
      if (this.filter.kind) {
        if (proxy.kind !== this.filter.kind) {
          return false;
        }
        if (this.filter.actionState && proxy.item.actionState !== this.filter.actionState) {
          return false;
        }
        if (this.filter.actionAssignee && proxy.item.assignedTo !== this.filter.actionAssignee) {
          return false;
        }
      }

      if (this.filter.textRegex === null) {
        return true;
      }

      for (var key in proxy.item) {
        if (key.charAt(0) !== '$' && this.getTypeForFilter(proxy.item[key]) === 'string' && proxy.item[key].match(this.filter.textRegex)) {
          return true;
        }
      }
      return false;
    }
  }

  getTypeForFilter(val): string {
    return val === null ? 'null' : typeof val;
  }
  
  isExpanded(): boolean {
    return !this.collapsed;
  }
  
  expand(expand: boolean): void {
    this.collapsed = !expand;
  }
}
