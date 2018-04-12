import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../../services/navigation/navigation.service';

import * as ItemProxy from '../../../../common/src/item-proxy';

import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { SessionService } from '../../services/user/session.service';
import { ItemRepository, RepoStates } from '../../services/item-repository/item-repository.service';
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
  private itemList: Array<Object>;
  dashboardTitle : string = '';
  private repoStatusSubject : BehaviorSubject<any>;

  // UI Switches 
  dashboardTypes = {
    'assignments' : 0,
    'userPreferences' : 1
  }
  dashboardType : any;

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
        console.log ('HEY!!!!!!!!!!!!!!!!!!');
        console.log(this.currentUser.relations.referencedBy)
        for(let referenceCategory in this.currentUser.relations.referencedBy) {

        }
      }
    });
    this.repoStatusSubject = this.itemRepository.getRepoStatusSubject();
    this.repoStatusSubject.subscribe(update => {
      if (RepoStates.SYNCHRONIZATION_SUCCEEDED === update.state) {
        // Do something eventually?
      }
    })
  }

  dashboardSelected(dashboard : DashboardSelections) {
    switch (dashboard) {
      case (DashboardSelections.ACTIVE_ASSIGNMENTS) :
        this.dashboardTitle = 'Active Assignments'
        this.dashboardType = this.dashboardTypes.assignments;
        break;
      case (DashboardSelections.COMPLETED_ASSIGNMENTS) :
        this.dashboardTitle = 'Completed Assignments';
        this.dashboardType = this.dashboardTypes.assignments;
        break;
      case (DashboardSelections.DUE_ASSIGNMENTS) :
        this.dashboardTitle = 'Due Assignments';
        this.dashboardType = this.dashboardTypes.assignments;
        break;
      case (DashboardSelections.USER_PREFERENCES) :
        this.dashboardTitle = 'User Preferences'
        this.dashboardType = this.dashboardTypes.userPreferences; 
        break;
    }
  }
}
