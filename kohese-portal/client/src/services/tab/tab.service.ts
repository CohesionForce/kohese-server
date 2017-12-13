import { Tab } from './Tab.class';
import { Injectable } from '@angular/core';

import { Subject } from 'rxjs/Subject'

import * as _ from 'underscore';

@Injectable()
export class TabService {
  tabCount : number;
  tabs: Array<Tab>;
  currentTab: Subject<Tab>;


  constructor () {
    this.tabCount = 0;
    this.currentTab = new Subject();
    let baseTab = this.createTab('Dashboard', '/dashboard', {});
    this.tabs = [baseTab];
  }

  ngOnInit (): void {

  }

  private incrementTabs (): void {
    this.tabCount++
  }

  getTabId (): number {
    return this.tabCount;
  }

  setCurrentTab (tab: Tab): void {
    console.log(this);
    if (tab)
      this.currentTab.next(tab);
  }

  getCurrentTab (): Subject<Tab> {
    console.log(this);
    return this.currentTab;
  }

  createTab (state, route, params): Tab {
    var tab = new Tab(state, route, params, this.tabCount);
    this.incrementTabs();
    this.setCurrentTab(tab);

    return tab;
  }

  //
  //
  //


}
