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
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';

// Other External Dependencies

// Kohese
import { ItemProxy } from '../../../../../common/src/item-proxy';

// Used to determine specific component dashboard being loaded
export enum DashboardSelections {
  DUE_ASSIGNMENTS,
  OPEN_ASSIGNMENTS,
  COMPLETED_ASSIGNMENTS,
  PROJECT_OVERVIEW,
  USER_STATISTICS,
  PROJECT_STATUS
}

// Used to determine greater sub-type of dashboards
export enum DashboardTypes {
  PROJECT,
  ASSIGNMENT
}

// Specific non-overlapping menu configurations
enum MenuTypes {
  PERSONAL,
  PROJECT
}

export interface DashboardSelectionInfo {
  dashboard: DashboardSelections,
  dashboardType: DashboardTypes
}

@Component({
  selector: 'dashboard-selector',
  templateUrl: './dashboard-selector.component.html',
  styleUrls: ['./dashboard-selector.component.scss']
})
export class DashboardSelectorComponent implements OnInit, OnDestroy {
  @Input() user: ItemProxy;
  dashboards: DashboardSelections;
  DashboardTypes: any = DashboardTypes
  DashboardSelections: any = DashboardSelections;
  MenuTypes: any = MenuTypes;

  whichLink: string;

  @Output() dashboardSelected: EventEmitter<DashboardSelectionInfo> = new EventEmitter<DashboardSelectionInfo>();
  selectedDashboard: DashboardSelectionInfo;
  menuType : MenuTypes;

  routerParams = this.router.params;
  routerParamSubscription: Subscription;

  constructor(private router: ActivatedRoute){}

  ngOnInit() {
    this.selectDashboard(DashboardSelections.OPEN_ASSIGNMENTS);
    this.routerParamSubscription = this.routerParams.subscribe((params: Params) => {
      if (params['appbarNav']) {
        this.linkClicked('open');
        this.selectDashboard(DashboardSelections.OPEN_ASSIGNMENTS);
      }
      if (params['project-id'] && !this.whichLink) {
        this.linkClicked('project status');
        this.selectDashboard(DashboardSelections.PROJECT_STATUS);
      }
    });
  }

  ngOnDestroy() {
    this.routerParamSubscription.unsubscribe();
  }

  selectDashboard(dashboard: DashboardSelections) {
    console.log(dashboard);
    switch (dashboard) {
        case (DashboardSelections.DUE_ASSIGNMENTS):
        this.selectedDashboard = {
          dashboard: DashboardSelections.DUE_ASSIGNMENTS,
          dashboardType: DashboardTypes.ASSIGNMENT
        };
        this.menuType = MenuTypes.PERSONAL;
        this.dashboardSelected.emit(this.selectedDashboard);
        break;

        case (DashboardSelections.OPEN_ASSIGNMENTS):
        this.selectedDashboard = {
          dashboard: DashboardSelections.OPEN_ASSIGNMENTS,
          dashboardType: DashboardTypes.ASSIGNMENT
        };
        this.menuType = MenuTypes.PERSONAL;
        this.dashboardSelected.emit(this.selectedDashboard)
        break;

      case (DashboardSelections.COMPLETED_ASSIGNMENTS):
        this.selectedDashboard = {
          dashboard: DashboardSelections.COMPLETED_ASSIGNMENTS,
          dashboardType: DashboardTypes.ASSIGNMENT
        };
        this.menuType = MenuTypes.PERSONAL;
        this.dashboardSelected.emit(this.selectedDashboard)
        break;

      case (DashboardSelections.USER_STATISTICS):
        this.selectedDashboard = {
          dashboard: DashboardSelections.USER_STATISTICS,
          dashboardType: DashboardTypes.PROJECT
        };
        this.menuType = MenuTypes.PROJECT;
        this.dashboardSelected.emit(this.selectedDashboard)
        break;

      case (DashboardSelections.PROJECT_OVERVIEW):
        this.selectedDashboard = {
          dashboard: DashboardSelections.PROJECT_OVERVIEW,
          dashboardType: DashboardTypes.PROJECT
        };
        this.menuType = MenuTypes.PROJECT;
        this.dashboardSelected.emit(this.selectedDashboard)
        break;
      case (DashboardSelections.PROJECT_STATUS):
        this.selectedDashboard = {
          dashboard: DashboardSelections.PROJECT_STATUS,
          dashboardType: DashboardTypes.PROJECT
        };
        this.menuType = MenuTypes.PROJECT;
        this.dashboardSelected.emit(this.selectedDashboard)
        break;
      default:
        console.error('Invalid Dashboard selection :');
        console.error(dashboard);
    }

    this.dashboardSelected.emit(this.selectedDashboard);
  }

  public linkClicked(link: string) {
    this.whichLink = link;
  }
}


