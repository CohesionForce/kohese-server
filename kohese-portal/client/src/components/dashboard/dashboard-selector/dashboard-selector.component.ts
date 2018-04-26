import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { ItemProxy } from '../../../../../common/src/item-proxy';


export enum DashboardSelections {
  ACTIVE_ASSIGNMENTS,
  DUE_ASSIGNMENTS,
  COMPLETED_ASSIGNMENTS,
  USER_PREFERENCES
}

@Component({
  selector: 'dashboard-selector',
  templateUrl: './dashboard-selector.component.html',
  styleUrls: ['./dashboard-selector.component.scss']
})
export class DashboardSelectorComponent implements OnInit, OnDestroy {
  @Input()
  user : ItemProxy;
  dashboards : DashboardSelections;

  @Output()
  dashboardSelected : EventEmitter<DashboardSelections> = new EventEmitter();
  selectedDashboard : string;

  constructor () {

  }

  ngOnInit () {
    this.selectDashboard('active');
  }

  ngOnDestroy () {

  }

  selectDashboard(dashboard : string) {
    switch (dashboard) {
      case ('active') :
        this.selectedDashboard = 'active';
        this.dashboardSelected.emit(DashboardSelections.ACTIVE_ASSIGNMENTS);
        break;
      case('due') :
        this.selectedDashboard = 'due';
        this.dashboardSelected.emit(DashboardSelections.DUE_ASSIGNMENTS);
        break;
      case('completed') :
        this.selectedDashboard = 'completed';
        this.dashboardSelected.emit(DashboardSelections.COMPLETED_ASSIGNMENTS);
        break;
      case('preferences') :
        this.selectedDashboard = 'preferences';
        this.dashboardSelected.emit(DashboardSelections.USER_PREFERENCES);
        break;
      default :
        this.dashboardSelected.emit(undefined);
        console.error('Invalid Dashboard selection :');
        console.error(dashboard);
    }
  }
}
