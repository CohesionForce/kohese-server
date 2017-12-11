import { Tab } from './Tab.class';
import { Injectable } from '@angular/core';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';

import * as _ from 'underscore';

@Injectable()
export class TabService implements OnInit {
  tabCount : number;
  currentTab: Tab;

  constructor () {

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
    this.currentTab = tab;
  }

  getCurrentTab (): Tab {
    return this.currentTab;
  }

  createTab (state, params): Tab {
    var tab = new Tab(state, params, this.tabCount);
    this.incrementTabs();

    return tab;
  }

  //
  //
  //


}
