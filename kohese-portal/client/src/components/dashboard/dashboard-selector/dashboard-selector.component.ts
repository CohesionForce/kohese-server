import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
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
  USER,
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
  @Input()
  user: ItemProxy;
  dashboards: DashboardSelections;

  DashboardTypes: any = DashboardTypes
  DashboardSelections: any = DashboardSelections;
  MenuTypes: any = MenuTypes;

  @Output()
  dashboardSelected: EventEmitter<DashboardSelectionInfo> = new EventEmitter<DashboardSelectionInfo>();
  selectedDashboard: DashboardSelectionInfo;
  menuType : MenuTypes;

  constructor(private router: ActivatedRoute) {

  }

  ngOnInit() {
    this.selectDashType(DashboardTypes.ASSIGNMENT);
    this.router.params.subscribe((params: Params) => {
      if (params['project-id']) {
        this.selectDashType(DashboardTypes.PROJECT);
      }
    });
  }

  ngOnDestroy() {

  }

  selectDashType(type: DashboardTypes) {
    console.log(type);
    switch (type) {
      case (DashboardTypes.ASSIGNMENT):
        this.selectedDashboard = {
          dashboard: DashboardSelections.OPEN_ASSIGNMENTS,
          dashboardType: DashboardTypes.ASSIGNMENT
        }
        this.menuType = MenuTypes.PERSONAL
        this.dashboardSelected.emit(this.selectedDashboard);
        break;
      case (DashboardTypes.PROJECT):
        this.selectedDashboard = {
          dashboard: DashboardSelections.PROJECT_OVERVIEW,
          dashboardType: DashboardTypes.PROJECT
        };
        this.menuType = MenuTypes.PROJECT
        this.dashboardSelected.emit(this.selectedDashboard);
        break;
        this.menuType = MenuTypes.PERSONAL
        this.dashboardSelected.emit(this.selectedDashboard);
        break;
    }
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
        break;

        case (DashboardSelections.OPEN_ASSIGNMENTS):
        this.selectedDashboard = {
          dashboard: DashboardSelections.OPEN_ASSIGNMENTS,
          dashboardType: DashboardTypes.ASSIGNMENT
        };
        this.menuType = MenuTypes.PERSONAL;
        break;

      case (DashboardSelections.COMPLETED_ASSIGNMENTS):
        this.selectedDashboard = {
          dashboard: DashboardSelections.COMPLETED_ASSIGNMENTS,
          dashboardType: DashboardTypes.ASSIGNMENT
        };
        this.menuType = MenuTypes.PERSONAL;
        break;

      case (DashboardSelections.USER_STATISTICS):
        this.selectedDashboard = {
          dashboard: DashboardSelections.USER_STATISTICS,
          dashboardType: DashboardTypes.PROJECT
        };
        this.menuType = MenuTypes.PROJECT;
        break;

      case (DashboardSelections.PROJECT_OVERVIEW):
        this.selectedDashboard = {
          dashboard: DashboardSelections.PROJECT_OVERVIEW,
          dashboardType: DashboardTypes.PROJECT
        };
        this.menuType = MenuTypes.PROJECT;
        break;
      case (DashboardSelections.PROJECT_STATUS):
        this.selectedDashboard = {
          dashboard: DashboardSelections.PROJECT_STATUS,
          dashboardType: DashboardTypes.PROJECT
        };
        this.menuType = MenuTypes.PROJECT;
        break;
      default:
        console.error('Invalid Dashboard selection :');
        console.error(dashboard);
    }

    this.dashboardSelected.emit(this.selectedDashboard);
  }
}


