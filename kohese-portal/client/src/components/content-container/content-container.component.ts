import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/mergeMap';
import { TabService } from '../../services/tab/tab.service';
import { BundleService } from '../../services/bundle/bundle.service';
import { Tab } from '../../services/tab/Tab.class';
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
      .subscribe( x=> console.log(`Subscriber test ${x}`))
  }

  setTab(tab): void {
    this.tabService.setCurrentTab(tab)
  }

  deleteTab(tab): void {

  }

  addTab(title: string, route: string, params: Object): void {
    let newTab = this.tabService.createTab(title, route, params)
    this.tabs.push(newTab);
    this.setTab(newTab);

    console.log(this.tabs)

  }
}
