import { Subscription ,  BehaviorSubject } from 'rxjs';
import { CurrentUserService } from './../../services/user/current-user.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationService } from '../../services/navigation/navigation.service';

import { ItemProxy } from '../../../../common/src/item-proxy';

import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { SessionService } from '../../services/user/session.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';

import { DashboardSelections, DashboardSelectionInfo, DashboardTypes } from './dashboard-selector/dashboard-selector.component';
import { ProjectInfo, ProjectService } from '../../services/project-service/project.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls : ['./dashboard.component.scss']
})

export class DashboardComponent extends NavigatableComponent implements OnInit, OnDestroy {
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
  initialized : boolean = false;

  DashboardSelections : any = DashboardSelections;
  DashboardTypes : any = DashboardTypes

  dashboardSelectionStream : BehaviorSubject<DashboardSelections> = new BehaviorSubject<DashboardSelections>(undefined);

  treeConfigSubscription : Subscription;
  changeSubjectSubscription : Subscription;

  constructor(protected navigationService : NavigationService,
              private projectService : ProjectService,
              private itemRepository : ItemRepository,
              private currentUserService : CurrentUserService) {
    super(navigationService);
    this.selectedProject = projectService.savedProject;
  }

  ngOnInit() {
    this.currentUserService.getCurrentUserSubject().subscribe((userInfo) => {
      if (userInfo) {
        this.username = userInfo.username;
        this.treeConfigSubscription =
          this.itemRepository.getTreeConfig().subscribe((newConfig)=>{
          if (newConfig) {
          this.currentUser = newConfig.config.getProxyByProperty('KoheseUser', 'username', this.username);
          this.changeSubjectSubscription = newConfig.config.getChangeSubject().subscribe((change)=>{
          })
          this.buildAssignmentList();
          this.initialized = true;
          }
        })
      }
    });
  }

  ngOnDestroy () {
    if (this.treeConfigSubscription) {
      this.treeConfigSubscription.unsubscribe()
      }
    if (this.changeSubjectSubscription) {
      this.changeSubjectSubscription.unsubscribe();
    }
    }

  dashboardSelected(dashboard : DashboardSelectionInfo) {
    this.selectedDashboard = dashboard;
    this.dashboardSelectionStream.next(this.selectedDashboard.dashboard);
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
    this.projectService.savedProject = this.selectedProject;
  }
}
