import { Tab } from './Tab.class';
import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject'

import * as _ from 'underscore';
import { Router } from '@angular/router';

@Injectable()
export class TabService {
  private tabCount : number;
  private tabList: Array<Tab>;
  currentTabSubject: BehaviorSubject<Tab>;
  currentTabListSubject: BehaviorSubject<Array<Tab>>;



  constructor (private router: Router) {
    this.tabCount = 0;
    this.initService();
  }

  initService() : void {
    let baseTab = new Tab('Dashboard', '/dashboard', {}, this.tabCount)
    this.incrementTabs();
    this.currentTabSubject = new BehaviorSubject(baseTab);
    this.tabList = [baseTab];
    this.currentTabListSubject = new BehaviorSubject(this.tabList);
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
    {
      this.currentTabSubject.next(tab);
      this.router.navigate([tab.route], {queryParams: tab.params});
    }
  }

  getCurrentTab (): BehaviorSubject<Tab> {
    return this.currentTabSubject;
  }

  getTabList (): BehaviorSubject<Array<Tab>> {
    return this.currentTabListSubject;
  }

  createTab (state, route, params): void {
    var tab = new Tab(state, route, params, this.tabCount);
    this.incrementTabs();
    this.tabList.push(tab);
    this.setCurrentTab(tab);
    this.currentTabListSubject.next(this.tabList);

  }

  removeTab(tab): void {

  }

  //
  //
  //


}
