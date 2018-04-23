import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import * as ItemProxy from '../../../../../common/src/item-proxy';

import { DashboardSelections } from '../dashboard-selector/dashboard-selector.component';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ProxySelectorDialogComponent } from '../../user-input/k-proxy-selector/proxy-selector-dialog/proxy-selector-dialog.component';

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
    this.dialogService.openComponentDialog(ProxySelectorDialogComponent, {
      data : {}
    })
      .updateSize('70%', '70%').afterClosed().subscribe((selection: any) => {
        console.log(selection);
        if (selection) {
          this.project = this.generateProjectInfo(selection)
          this.projectStream.next(this.project);
        }
      });
  }

  generateProjectInfo(proxy : ItemProxy) : ProjectInfo {
    let userMap = {};
    let userList = [];
    let projectList = proxy.getSubtreeAsList();
    for (let idx in projectList) {
      let currentProxy = projectList[idx].proxy;
      if (currentProxy.relations.references[currentProxy.kind]) {
        let assignedProxy = currentProxy.relations.references[currentProxy.kind].assignedTo;
        if (assignedProxy && !userMap[assignedProxy.item.name]) {
          userMap[assignedProxy.item.name] = assignedProxy;  
        }
      }
    }
    for (let user in userMap) {
      userList.push(userMap[user]);
    }

    return {
      proxy : proxy,
      users : userList 
    }
  }


}
