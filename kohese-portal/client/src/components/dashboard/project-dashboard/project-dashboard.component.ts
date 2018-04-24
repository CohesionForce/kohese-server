import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import * as ItemProxy from '../../../../../common/src/item-proxy';

import { DashboardSelections } from '../dashboard-selector/dashboard-selector.component';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ProjectSelectorComponent} from './project-selector/project-selector.component'
import { ProjectInfo } from '../../../services/project-service/project.service';

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
  projectStream : BehaviorSubject<ProjectInfo>;

  constructor(private dialogService: DialogService) { }

  ngOnInit() {
    this.projectStream = new BehaviorSubject<ProjectInfo>(undefined);
    this.dashboardSelectionSub =
      this.dashboardSelectionStream.subscribe((dashboard) => {
        this.dashboardSelection = dashboard;
      })
  }

  ngOnDestroy() {
    this.dashboardSelectionSub.unsubscribe();
  }

  openProjectSelection() {
    this.dialogService.openComponentDialog(ProjectSelectorComponent, {
      data : {}
    })
      .updateSize('70%', '70%').afterClosed().subscribe((selection: ProjectInfo) => {
        console.log(selection);
        if (selection) {
          this.project = selection
          this.projectStream.next(this.project);
        }
      });
  }




}
