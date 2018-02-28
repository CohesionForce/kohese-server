import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../../services/navigation/navigation.service';

import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { SessionService } from '../../services/user/session.service';
import { ItemRepository, State } from '../../services/item-repository/item-repository.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})

export class DashboardComponent extends NavigatableComponent implements OnInit {
  private currentUser : string;
  private itemList: Array<Object>;

  private assignedItems : Array<any>;
  private assignedFilter : Object;
  private acceptedItems : Array<any>;
  private acceptedFilter : Object;
  private inWorkItems : Array<any>;
  private inWorkFilter: Object;
  private observedIssuesItems : Array<any>;
  private observedIssuesFilter : Object;
  private inAnalysisIssuesItems : Array<any>;
  private inAnalysisIssueFilter : Object;
  private requiresActionItems : Array<any>;
  private requiresActionFilter : Object;
  private assignedTasks : Array<any>;
  private assignedTaskFilter : Object;
  private acceptedTasks : Array<any>;
  private acceptedTasksFilter : Object;
  private inWorkTasks : Array<any>;
  private inWorkTasksFilter : Object;
  private repoStatusSubject : BehaviorSubject<any>;

  constructor(protected NavigationService : NavigationService,
              private ItemRepository : ItemRepository,
              private sessionService: SessionService) {
    super(NavigationService);
               }

  ngOnInit() {
    this.sessionService.getSessionUser().subscribe((userProxy) => {
      if (userProxy) {
        this.currentUser = userProxy.item.name;
      }
    });
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
      if (State.SYNCHRONIZATION_SUCCEEDED === update.state) {
        console.log(this.ItemRepository.getRootProxy());
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
