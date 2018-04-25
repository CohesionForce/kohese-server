import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ProjectInfo } from '../../../../services/project-service/project.service';
import { Observable, Subscription } from 'rxjs';

import * as ItemProxy from '../../../../../../common/src/item-proxy';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { DetailsDialogComponent } from '../../../details/details-dialog/details-dialog.component';

@Component({
  selector: 'project-overview',
  templateUrl: './project-overview.component.html',
  styleUrls: ['./project-overview.component.scss']
})
export class ProjectOverviewComponent implements OnInit, OnDestroy {
  @Input()
  projectStream: Observable<ProjectInfo>;
  projectStreamSub: Subscription;
  project: ProjectInfo

  projectItems: Array<ItemProxy>;
  activityList: Array<ItemProxy> = [];

  constructor(private dialogService: DialogService) {

  }

  ngOnInit() {
    this.projectStreamSub = this.projectStream.subscribe((newProject: ProjectInfo) => {
      if (newProject) {
        this.project = newProject;
        this.projectItems = newProject.proxy.getRelationsByAttribute().references.projectItems.Project;
        this.activityList = [];
        for (let proxy of this.projectItems) {
          let newItems = proxy.getDescendants();
          this.activityList = this.activityList.concat(proxy.getDescendants())
        }
        // Strip non-unique values
        this.activityList = Array.from(new Set(this.activityList));
        this.activityList.sort((a, b) => {
          if (a.item.modifiedOn > b.item.modifiedOn) {
            return -1
          } else if (a.item.modifiedOn <= b.item.modifiedOn) {
            return 1;
          }
        })
      }
    })
  }

  ngOnDestroy() {
    this.projectStreamSub.unsubscribe();
  }

  openProxyDetails(proxy: ItemProxy) {
    this.dialogService.openComponentDialog(DetailsDialogComponent, {
      data : {
        itemProxy : proxy
      }
    }).updateSize('70%', '70%')
      .afterClosed().subscribe((results)=>{

      });
  }

}
