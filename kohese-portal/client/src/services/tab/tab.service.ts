import { Tab } from './Tab.class';
import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject'

import { Router } from '@angular/router';
import { NavigationService } from '../navigation/navigation.service';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class TabService {
  private nextId: number = 0;
  private tabList: Array<Tab> = [];
  currentTabSubject: BehaviorSubject<Tab>;
  currentTabListSubject: BehaviorSubject<Array<Tab>>;

  constructor(private router: Router,
               private NavigationService : NavigationService) {
    this.initService();
  }

  initService() : void {
    // Setting up the base tab
    let baseTab = new Tab('Dashboard', {}, this.nextId++, this.tabList.length,
                            this.NavigationService.getNavUpdates());
    this.currentTabSubject = new BehaviorSubject(baseTab);
    // Setting up the starting tab list
    this.tabList.push(baseTab);
    this.currentTabListSubject = new BehaviorSubject(this.tabList);
  }

  setCurrentTab(tab: Tab): void {
    if (tab) {
      this.currentTabSubject.next(tab);
      this.router.navigate([tab.route, tab.params]);
    }
  }

  getCurrentTab(): BehaviorSubject<Tab> {
    return this.currentTabSubject;
  }

  getTabList(): BehaviorSubject<Array<Tab>> {
    return this.currentTabListSubject;
  }

  createTab(location: string, params: any): void {
    let tab: Tab = new Tab(location, params, this.nextId++, this.tabList.length,
                      this.NavigationService.getNavUpdates());
    this.tabList.push(tab);
    this.currentTabListSubject.next(this.tabList);
    this.setCurrentTab(tab);
  }

  removeTab(tab: Tab): void {
    // If tab is currently selected select the previous tab,
    // If it is the first tab get the next one
    // If it is the only tab, recreate the base tab

    if (tab.id === this.currentTabSubject.getValue().id) {
      if (tab.position === 0) {
        if (this.tabList.length === 1) {
          this.createTab('Dashboard', {});
        } else {
          this.setCurrentTab(this.tabList[1]);
        }
      } else if (tab.position === (this.tabList.length - 1)) {
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

  updatePositions(): void {
    for (var i = 0; i < this.tabList.length; i++) {
      this.tabList[i].position = i;
    }
  }
}
