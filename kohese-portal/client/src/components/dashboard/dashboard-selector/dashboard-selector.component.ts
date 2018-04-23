import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import * as ItemProxy from '../../../../../common/src/item-proxy';


// Used to determine specific component dashboard being loaded
export enum DashboardSelections {
  ACTIVE_ASSIGNMENTS,
  DUE_ASSIGNMENTS,
  COMPLETED_ASSIGNMENTS,
  USER_PREFERENCES,
  PROJECT_OVERVIEW,
  USER_STATISTICS
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
  dashboardSelected: EventEmitter<DashboardSelectionInfo> = new EventEmitter();
  selectedDashboard: DashboardSelectionInfo;
  menuType : MenuTypes;

  constructor() {

  }

  ngOnInit() {
    this.selectDashType(DashboardTypes.ASSIGNMENT);
  }

  ngOnDestroy() {

  }

  selectDashType(type: DashboardTypes) {
    console.log(type);
    switch (type) {
      case (DashboardTypes.ASSIGNMENT):
        this.selectedDashboard = {
          dashboard: DashboardSelections.ACTIVE_ASSIGNMENTS,
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
      case (DashboardTypes.USER):
        this.selectedDashboard = {
          dashboard: DashboardSelections.USER_PREFERENCES,
          dashboardType: DashboardTypes.PROJECT
        };
        this.menuType = MenuTypes.PERSONAL
        this.dashboardSelected.emit(this.selectedDashboard);
        break;
    }
  }

  selectDashboard(dashboard: DashboardSelections) {
    console.log(dashboard);
    switch (dashboard) {

      case (DashboardSelections.ACTIVE_ASSIGNMENTS):
        this.selectedDashboard = {
          dashboard: DashboardSelections.ACTIVE_ASSIGNMENTS,
          dashboardType: DashboardTypes.ASSIGNMENT
        };
        this.menuType = MenuTypes.PERSONAL;
        break;

      case (DashboardSelections.DUE_ASSIGNMENTS):
        this.selectedDashboard = {
          dashboard: DashboardSelections.DUE_ASSIGNMENTS,
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

      case (DashboardSelections.USER_PREFERENCES):
        this.selectedDashboard = {
          dashboard: DashboardSelections.USER_PREFERENCES,
          dashboardType: DashboardTypes.USER
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

      default:
        console.error('Invalid Dashboard selection :');
        console.error(dashboard);
    }
    
    this.dashboardSelected.emit(this.selectedDashboard);
  }
}


