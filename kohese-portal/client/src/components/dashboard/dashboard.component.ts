import { Component, OnInit } from '@angular/core';
import { BundleService } from '../../services/bundle/bundle.service';
import { NavigationService } from '../../services/navigation/navigation.service';

import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { TabService } from '../../services/tab/tab.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})

export class DashboardComponent extends NavigatableComponent implements OnInit {
  currentUser : string;
  itemList: Array<Object>;

  assignedItems : Array<any>;
  assignedFilter : Object;
  acceptedItems : Array<any>;
  acceptedFilter : Object;
  inWorkItems : Array<any>;
  inWorkFilter: Object;
  observedIssuesItems : Array<any>;
  observedIssuesFilter : Object;
  inAnalysisIssuesItems : Array<any>;
  inAnalysisIssueFilter : Object;
  requiresActionItems : Array<any>;
  requiresActionFilter : Object;
  assignedTasks : Array<any>;
  assignedTaskFilter : Object;
  acceptedTasks : Array<any>;
  acceptedTasksFilter : Object;
  inWorkTasks : Array<any>;
  inWorkTasksFilter : Object;
  repoStatusSubject : BehaviorSubject<any>;



  constructor(private bundleService: BundleService,
              protected NavigationService : NavigationService,
              protected TabService : TabService,
              private ItemRepository : ItemRepository) {
    super(NavigationService, TabService);
               }

  ngOnInit() {
    this.currentUser = 'Test user'; // TODO - Pull from user service
    this.itemList = this.testProxies();
    this.assignedItems = this.testProxies();
    this.assignedFilter = {};
    this.acceptedItems = this.testProxies();
    this.acceptedFilter = {};
    this.inWorkItems = this.testProxies();
    this.inWorkFilter = {};
    this.observedIssuesItems = this.testProxies();
    this.observedIssuesFilter = {};
    this.inAnalysisIssuesItems = this.testProxies();
    this.inAnalysisIssueFilter = {};
    this.requiresActionFilter = {};
    this.requiresActionItems = this.testProxies();
    this.assignedTasks = this.testProxies();
    this.assignedTaskFilter = {};
    this.acceptedTasks = this.testProxies();
    this.acceptedTasksFilter = {};
    this.inWorkTasks = this.testProxies();
    this.inWorkTasksFilter = {};
    this.repoStatusSubject = this.ItemRepository.getRepoStatusSubject();
    this.repoStatusSubject.subscribe(update => {
      if (update.connected) {
        console.log(this.ItemRepository.getRootProxy())
      }
    })
  }

  testProxies () : Array<object> {
    return [
      {item: {
        name: 'Test proxy'
        }
      }
    ]
  }
}
