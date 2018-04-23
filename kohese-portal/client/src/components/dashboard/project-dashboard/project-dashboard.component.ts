import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import * as ItemProxy from '../../../../../common/src/item-proxy';

import { DashboardSelections } from '../dashboard-selector/dashboard-selector.component';
import { Observable, Subscription } from 'rxjs';

export interface ProjectInfo {
  proxy: ItemProxy,
  users: Array<any>
}

@Component({
  selector: 'project-dashboard',
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.scss']
})
export class ProjectDashboardComponent implements OnInit, OnDestroy {

  DashboardSelections: any = DashboardSelections;

  @Input()
  dashboardSelectionStream: Observable<DashboardSelections>
  dashboardSelectionSub: Subscription;
  dashboardSelection: DashboardSelections;

  project: ProjectInfo;

  constructor() { }

  ngOnInit() {
    this.dashboardSelectionSub =
      this.dashboardSelectionStream.subscribe((dashboard) => {
        this.dashboardSelection = dashboard;
      })
  }

  ngOnDestroy () {
    this.dashboardSelectionSub.unsubscribe();
  }

  openProjectSelection() {
    console.log('project-selection');
  }

}
