import { Component, OnInit } from '@angular/core'

import { of } from 'rxjs/observable/of';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { NavigatableComponent } from '../../classes/NavigationComponent.class'
import { Tab } from '../../services/tab/Tab.class';

import { TabService } from '../../services/tab/tab.service';
import { BundleService } from '../../services/bundle/bundle.service';
import { NavigationService } from '../../services/navigation/navigation.service';

@Component({
  selector: 'content-container',
  templateUrl: './content-container.component.html'
})
export class ContentContainerComponent extends NavigatableComponent
                                       implements OnInit, OnDestroy {
  tabs: Array<Tab>
  currentTabListener : BehaviorSubject<Tab>;
  tabListListener : BehaviorSubject<Array<Tab>>;

  constructor(private tabService: TabService,
              private bundleService: BundleService,
              protected NavigationService: NavigationService) {
      super(NavigationService, tabService);
      this.tabs = [];
  }

  ngOnInit(): void {
    this.currentTabListener = this.tabService.getCurrentTab();
    this.currentTabListener
      .subscribe( x=> console.log(`Subscriber test ${x}`));
    this.tabListListener = this.tabService.getTabList();
    this.tabListListener
      .subscribe( tabList=> this.tabs = tabList);
  }

  ngOnDestroy(): void {
    this.currentTabListener.unsubscribe();
    this.tabListListener.unsubscribe();
  }

  setTab(tab): void {
    this.tabService.setCurrentTab(tab)
  }

  removeTab(tab): void {
    this.tabService.removeTab(tab);
  }

  addTab(title: string, route: string, params: Object): void {
    this.tabService.createTab(title, route, params)
  }
}
