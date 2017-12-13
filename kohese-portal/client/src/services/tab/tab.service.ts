import { Tab } from './Tab.class';
import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject'

import * as _ from 'underscore';
import { Router } from '@angular/router';
import { NavigationService } from '../navigation/navigation.service';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class TabService {
  private tabCount : number;
  private currentTab : Tab;
  private tabList: Array<Tab>;
  currentTabSubject: BehaviorSubject<Tab>;
  currentTabListSubject: BehaviorSubject<Array<Tab>>;

  constructor (private router: Router,
               private NavigationService : NavigationService) {
    this.tabCount = 0;
    this.initService();
  }

  initService() : void {
    // Setting up the base tab
    let baseTab = new Tab('Dashboard', '/dashboard', {}, this.tabCount, 0,
                            this.NavigationService.getNavUpdates())
    this.incrementTabs();
    this.currentTabSubject = new BehaviorSubject(baseTab);
    this.currentTab = baseTab;
    // Setting up the starting tab list
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
    var tab = new Tab(state, route, params, this.tabCount, this.tabList.length,
                      this.NavigationService.getNavUpdates());
    this.incrementTabs();
    this.tabList.push(tab);
    this.setCurrentTab(tab);
    this.currentTabListSubject.next(this.tabList);

  }

  removeTab(tab: Tab): void {
    // If tab is currently selected select the previous tab,
    // If it is the first tab get the next one
    // If it is the only tab, recreate the base tab

    if (tab.id === this.currentTab.id) {
      if (tab.position === 0) {
        if (this.tabList.length === 1) {
          this.createTab('Dashboard', '/dashboard', {});
        } else {
          this.setCurrentTab(this.tabList[1]);
        }
      } else if (tab.position === this.tabList.length -1) {
        this.setCurrentTab(this.tabList[tab.position - 1]);
      } else {
        this.setCurrentTab(this.tabList[tab.position + 1]);
      }
    }

    tab.destroy();
    this.tabList.splice(tab.position, 1);
    this.updatePositions();
    this.currentTabListSubject.next(this.tabList);
  }

  updatePositions () {
    for (var i = 0; i < this.tabList.length; i++) {
      this.tabList[i].position = i;
    }
  }

  //
  //
  //


}
