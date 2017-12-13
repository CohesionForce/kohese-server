import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/mergeMap';
import { TabService } from '../../services/tab-service/tab.service';
import { BundleService } from '../../services/bundle-service/bundle.service';
import { Tab } from '../../services/tab-service/Tab.class';
import { Subject } from 'rxjs/Subject';



@Component({
  selector: 'content-container',
  templateUrl: './content-container.component.html'
})
export class ContentContainerComponent implements OnInit {
  tabs: Array<Tab>

  constructor(private tabService: TabService,
              private bundleService: BundleService) {

      this.tabs = [];
  }

  ngOnInit(): void {
    this.tabService.getCurrentTab()
      .subscribe( x=> console.log(`Subscriber test ${x}`));
    this.tabService.getTabList()
      .subscribe( tabList=> this.tabs = tabList);
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
