import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/mergeMap';
import { TabService } from '../../services/tab/tab.service';
import { BundleService } from '../../services/bundle/bundle.service';
import { Tab } from '../../services/tab/Tab.class';
import { Subject } from 'rxjs/Subject';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'content-container',
  templateUrl: './content-container.component.html'
})
export class ContentContainerComponent implements OnInit, OnDestroy {
  tabs: Array<Tab>
  currentTabListener : BehaviorSubject<Tab>;
  tabListListener : BehaviorSubject<Array<Tab>>;

  constructor(private tabService: TabService,
              private bundleService: BundleService) {

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
