import { Component, OnInit, Input, OnDestroy, EventEmitter, Output } from '@angular/core';
import { ItemProxy} from '../../../../../common/src/item-proxy';

import { DashboardSelections } from '../dashboard-selector/dashboard-selector.component';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { DialogService } from '../../../services/dialog/dialog.service';
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
  projectStream: BehaviorSubject<ProjectInfo>;

  treeConfigSubscription: Subscription;

  @Output()
  projectSelected: EventEmitter<ProjectInfo> = new EventEmitter<ProjectInfo>();

  constructor(private dialogService: DialogService,
    private itemRepository: ItemRepository) { }

  ngOnInit() {
    this.projectStream = new BehaviorSubject<ProjectInfo>(undefined);

    this.dashboardSelectionSub =
      this.dashboardSelectionStream.subscribe((dashboard) => {
        this.dashboardSelection = dashboard;
      })

    this.treeConfigSubscription = this.itemRepository.getTreeConfig()
      .subscribe((newConfig) => {
        if (newConfig) {
          if (newConfig.configType === TreeConfigType.HISTORICAL) {
            if (this.project) {
              this.openReselectDialog();
            }
          }
        }
      })

    if (this.savedProject) {
      this.project = this.savedProject;
      this.projectStream.next(this.project);
    }
  }

  ngOnDestroy() {
    this.dashboardSelectionSub.unsubscribe();
  }

  openProjectSelection() {
    this.dialogService.openComponentDialog(ProjectSelectorComponent, {
      data: {}
    })
      .updateSize('70%', '70%').afterClosed().subscribe((selection: ProjectInfo) => {
        console.log(selection);
        if (selection) {
          this.project = selection
          this.projectStream.next(this.project);
          this.projectSelected.emit(this.project);
        }
      });
  }

  openReselectDialog() {
    this.dialogService.openYesNoDialog('Reselect Project',
      'A new historical tree has been selected. Would you like to update your selected project?'
    ).subscribe((result) => {
      if (result) {
        this.openProjectSelection();
      }
    })

  }




}
