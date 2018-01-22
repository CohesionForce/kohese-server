import { Component, OnInit, OnDestroy } from '@angular/core'
import { MatTabChangeEvent } from '@angular/material';

import { of } from 'rxjs/observable/of';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { NavigatableComponent } from '../../classes/NavigationComponent.class'
import { Tab } from '../../services/tab/Tab.class';

import { TabService } from '../../services/tab/tab.service';
import { BundleService } from '../../services/bundle/bundle.service';
import { NavigationService } from '../../services/navigation/navigation.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'content-container',
  templateUrl: './content-container.component.html'
})
export class ContentContainerComponent extends NavigatableComponent
  implements OnInit, OnDestroy {
  private selectedTabIndex: number = 0;
  private tabs: Array<Tab> = [];
  private currentTabSub : Subscription;
  private tabListSub : Subscription;

  constructor(private tabService: TabService,
              private bundleService: BundleService,
              protected NavigationService: NavigationService) {
    super(NavigationService, tabService);
  }

  ngOnInit(): void {
    this.currentTabSub = this.tabService.getCurrentTab()
      .subscribe((tab) => {
      this.selectedTabIndex = this.tabs.indexOf(tab);
    });
    this.tabListSub = this.tabService.getTabList()
      .subscribe((tabList) => {
      this.tabs = tabList;
    });
  }

  ngOnDestroy(): void {
    this.currentTabSub.unsubscribe();
    this.tabListSub.unsubscribe();
  }
  
  tabSelectionChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.selectedTabIndex = tabChangeEvent.index;
    let t: Tab = this.tabs[tabChangeEvent.index];
    this.tabService.setCurrentTab(this.tabs[tabChangeEvent.index]);
  }

  removeTab(tab): void {
    this.tabService.removeTab(tab);
  }
}
