/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// Angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subscription ,  BehaviorSubject } from 'rxjs';

// Other External Dependencies

// Kohese
import { ItemProxy } from '../../../../common/src/item-proxy';
import { CurrentUserService } from './../../services/user/current-user.service';
import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { NavigationService } from '../../services/navigation/navigation.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { DashboardSelections, DashboardSelectionInfo, DashboardTypes } from './dashboard-selector/dashboard-selector.component';
import { ProjectInfo, ProjectService } from '../../services/project-service/project.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls : ['./dashboard.component.scss'],
})

export class DashboardComponent extends NavigatableComponent implements OnInit, OnDestroy {
  currentUser : ItemProxy;
  username : string;
  assignmentListStream : BehaviorSubject<Array<ItemProxy>> = new BehaviorSubject<Array<ItemProxy>>([]);

  /**Dashboard Initializations */
  opened: boolean = true;
  selectedDashboard : DashboardSelectionInfo = {
    dashboard : undefined,
    dashboardType : undefined
  };

  selectedProject : ProjectInfo;
  initialized : boolean = false;

  DashboardSelections : any = DashboardSelections;
  DashboardTypes : any = DashboardTypes

  dashboardSelectionStream : BehaviorSubject<DashboardSelections> = new BehaviorSubject<DashboardSelections>(undefined);

  /**Subscriptions */
  treeConfigSubscription : Subscription;
  changeSubjectSubscription : Subscription;

  constructor(protected navigationService : NavigationService,
              private projectService : ProjectService,
              private itemRepository : ItemRepository,
              private currentUserService : CurrentUserService,
              private title : Title
              ) {
    super(navigationService);
    this.title.setTitle('Dashboard');
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
      this.treeConfigSubscription.unsubscribe();
      }
    if (this.changeSubjectSubscription) {
      this.changeSubjectSubscription.unsubscribe();
    }
  }

  toggleDrawer() {
    this.opened = !this.opened;
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
