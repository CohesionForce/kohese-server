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
import { Component, OnInit, Input, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';

// Other External Dependencies

// Kohese
import { ProjectService } from './../../../services/project-service/project.service';
import { DetailsComponent } from './../../details/details.component';
import { DashboardSelections } from '../dashboard-selector/dashboard-selector.component';
import { DialogService } from '../../../services/dialog/dialog.service';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { ProjectSelectorComponent } from './project-selector/project-selector.component'
import { ProjectInfo } from '../../../services/project-service/project.service';
import { TreeConfigType, ItemRepository } from '../../../services/item-repository/item-repository.service';

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

  @Input()
  savedProject: ProjectInfo;
  project: ProjectInfo;

  treeConfigSubscription: Subscription;
  proxyChangeSubscription : Subscription;
  paramSubscription: Subscription;

  constructor(
    private dialogService: DialogService,
    private router: ActivatedRoute,
    private navigationService: NavigationService,
    private itemRepository: ItemRepository,
    private projectService : ProjectService,
    private title : Title
    ) {
      this.title.setTitle('Project Dashboard');
    }

  ngOnInit() {

    this.dashboardSelectionSub =
      this.dashboardSelectionStream.subscribe((dashboard) => {
        this.dashboardSelection = dashboard;
      })

    this.treeConfigSubscription = this.itemRepository.getTreeConfig()
      .subscribe((newConfig) => {
        if (newConfig) {
          if (this.proxyChangeSubscription) {
            this.proxyChangeSubscription.unsubscribe();
          }
          this.proxyChangeSubscription = newConfig.config.getChangeSubject().subscribe ((notification) => {
            if (notification) {
              // TODO Update the Project info in the generated list
              if (this.project && notification.proxy.item.id === this.project.proxy.item.id) {
                setTimeout(()=>{
                  this.projectService
                }, 1000)
              }
            }
          })

          if (newConfig.configType === TreeConfigType.HISTORICAL) {
            if (this.project) {
              this.openReselectDialog();
            }
          }
        }
      })

    if (this.savedProject) {
      this.project = this.savedProject;
      let projectName: string = this.project.proxy.item.name;
      this.title.setTitle('Project Dashboard | ' + projectName);
      this.projectService.projectStream.next(this.project);
    }

    this.navigationService.navigate('Dashboard', {
      'project-id': ( (this.project && this.project.proxy) ? this.project.proxy.item.id : '')
    });
    // Subscribe for URL changes
    this.paramSubscription = this.router.params.subscribe((params: Params) => {
      if (params['project-id']) {
        let project = this.projectService.getProjectById(params['project-id']);
        if (project !== this.project) {
          // Update the project based on params if it is different
          this.project = project;
          let projectTitle: string = this.project.proxy.item.name;
          this.title.setTitle('Project Dashboard | ' + projectTitle);
          this.projectService.projectStream.next(this.project);
          this.projectService.projectSelected.next(this.project);
          this.navigationService.navigate('Dashboard', {
            'project-id': (this.project.proxy ? this.project.proxy.item.id : '')
          });
        }
      }
    });
  }

  ngOnDestroy() {
    this.dashboardSelectionSub.unsubscribe();
    if(this.paramSubscription) {
      this.paramSubscription.unsubscribe();
    }
  }

  openProjectSelection() {
    this.dialogService.openComponentDialog(ProjectSelectorComponent, {
      data: {}
    })
      .updateSize('70%', '70%').afterClosed().subscribe((selection: ProjectInfo) => {
        console.log(selection);
        if (selection) {
          this.project = selection;
          let projectTitle: string = this.project.proxy.item.name;
          this.title.setTitle('Project Dashboard | ' + projectTitle);
          this.projectService.projectStream.next(this.project);
          this.projectService.projectSelected.next(this.project);
          this.navigationService.navigate('Dashboard', {
            'project-id': (this.project.proxy ? this.project.proxy.item.id : '')
          });
        }
      });
  }

  editProject() {
    this.dialogService.openComponentDialog(DetailsComponent, {
      data : {
        itemProxy : this.project.proxy
      }
      }).updateSize('80%', '80%')
      .afterClosed().subscribe((results)=>{
      // Probably need to do something here to spin off an update
      });
  }

  public async openReselectDialog(): Promise<void> {
    let result: any = await this.dialogService.openYesNoDialog('Reselect ' +
      'Project', 'A new historical tree has been selected. Would you like ' +
      'to update your selected project?');
    if (result) {
      this.openProjectSelection();
    }
  }
}
