import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../../services/navigation/navigation.service';

import { ItemProxy } from '../../../../common/src/item-proxy';

import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { SessionService } from '../../services/user/session.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { DashboardSelections } from './dashboard-selector/dashboard-selector.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls : ['./dashboard.component.scss']
})

export class DashboardComponent extends NavigatableComponent implements OnInit {
  currentUser : ItemProxy;
  username : string;
  assignmentListStream : BehaviorSubject<Array<ItemProxy>> = new BehaviorSubject<Array<ItemProxy>>([]);
  private itemList: Array<Object>;
  private repoStatusSubject : BehaviorSubject<any>;

  // UI Switches
  dashboardTypes = {
    'assignments' : 0,
    'userPreferences' : 1
  }
  dashboardType : any;
  assignmentTypeStream : BehaviorSubject<DashboardSelections> = new BehaviorSubject<DashboardSelections>(undefined);

  constructor(protected navigationService : NavigationService,
              private itemRepository : ItemRepository,
              private sessionService: SessionService) {
    super(navigationService);
               }

  ngOnInit() {
    this.sessionService.getSessionUser().subscribe((userProxy) => {
      if (userProxy) {
        this.currentUser = userProxy;
        this.username = userProxy.item.name;
        this.buildAssignmentList();
      }
    });
  }

  dashboardSelected(dashboard : DashboardSelections) {
    switch (dashboard) {
      case (DashboardSelections.ACTIVE_ASSIGNMENTS) :
        this.dashboardType = this.dashboardTypes.assignments;
        this.assignmentTypeStream.next(DashboardSelections.ACTIVE_ASSIGNMENTS);
        break;
      case (DashboardSelections.COMPLETED_ASSIGNMENTS) :
        this.dashboardType = this.dashboardTypes.assignments;
        this.assignmentTypeStream.next(DashboardSelections.COMPLETED_ASSIGNMENTS);
        break;
      case (DashboardSelections.DUE_ASSIGNMENTS) :
        this.dashboardType = this.dashboardTypes.assignments;
        this.assignmentTypeStream.next(DashboardSelections.DUE_ASSIGNMENTS);
        break;
      case (DashboardSelections.USER_PREFERENCES) :
        this.dashboardType = this.dashboardTypes.userPreferences;
        break;
    }
  }

  buildAssignmentList () {
    let assignmentList = [];
    for(let referenceCategory in this.currentUser.relations.referencedBy) {
      for(let reference in this.currentUser.relations.referencedBy[referenceCategory].assignedTo)
        assignmentList.push(
          this.currentUser.relations.referencedBy[referenceCategory].assignedTo[reference]
        )
    }
    this.assignmentListStream.next(assignmentList);
  }
}
