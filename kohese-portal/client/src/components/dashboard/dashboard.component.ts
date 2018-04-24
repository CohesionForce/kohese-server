import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../../services/navigation/navigation.service';

import * as ItemProxy from '../../../../common/src/item-proxy';

import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { SessionService } from '../../services/user/session.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { DashboardSelections, DashboardSelectionInfo, DashboardTypes } from './dashboard-selector/dashboard-selector.component';
import { ProjectInfo } from '../../services/project-service/project.service';

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

  selectedDashboard : DashboardSelectionInfo = {
    dashboard : undefined,
    dashboardType : undefined
  };

  selectedProject : ProjectInfo;

  DashboardSelections : any = DashboardSelections;
  DashboardTypes : any = DashboardTypes

  dashboardSelectionStream : BehaviorSubject<DashboardSelections> = new BehaviorSubject<DashboardSelections>(undefined);

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

  dashboardSelected(dashboard : DashboardSelectionInfo) {
    let assignment
    switch (dashboard.dashboard) {
      case (DashboardSelections.ACTIVE_ASSIGNMENTS) :
      case (DashboardSelections.COMPLETED_ASSIGNMENTS) :
      case (DashboardSelections.DUE_ASSIGNMENTS) :
      case (DashboardSelections.PROJECT_OVERVIEW) :
      case (DashboardSelections.USER_STATISTICS) :
        this.selectedDashboard = dashboard;
        this.dashboardSelectionStream.next(this.selectedDashboard.dashboard);
        break;
      default : 
        this.selectedDashboard = dashboard;
        console.log('Unhandled Dashboard Selection');
        console.log(dashboard);
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

  onProjectSelected(newProject : ProjectInfo) {
    this.selectedProject = newProject;
  }
}
