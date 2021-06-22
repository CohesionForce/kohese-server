/*
 * Copyright (c) 2021 CohesionForce inc. | www.CohesionForce.com | info@CohesionForce.com
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


import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ProjectInfo } from '../../../../services/project-service/project.service';
import { Observable, Subscription } from 'rxjs';

import { ItemProxy} from '../../../../../../common/src/item-proxy';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { DetailsComponent } from '../../../details/details.component';

@Component({
  selector: 'project-overview',
  templateUrl: './project-overview.component.html',
  styleUrls: ['./project-overview.component.scss']
})
export class ProjectOverviewComponent implements OnInit, OnDestroy {
  @Input()
  projectStream: Observable<ProjectInfo>;
  projectStreamSub: Subscription;

  projectItems: Array<ItemProxy>;
  lostProjectItems : Array<ItemProxy>;
  activityList: Array<ItemProxy> = [];

  constructor(private dialogService: DialogService) {

  }

  ngOnInit() {
    this.projectStreamSub = this.projectStream.subscribe((newProject: ProjectInfo) => {
      if (newProject) {
        this.lostProjectItems = [];

        this.projectItems = newProject.projectItems;
        if (newProject.lostProjectItems) {
          this.lostProjectItems = newProject.lostProjectItems;
        }

        this.activityList = [];
        for (let proxy of this.projectItems) {
          let newItems = proxy.getDescendants();
          this.activityList = this.activityList.concat(proxy.getDescendants())
        }
        // Strip non-unique values
        this.activityList = Array.from(new Set(this.activityList));
      }
    })
  }

  ngOnDestroy() {
    this.projectStreamSub.unsubscribe();
  }

  openProxyDetails(proxy: ItemProxy) {
    this.dialogService.openComponentDialog(DetailsComponent, {
      data : {
        itemProxy : proxy
      }
    }).updateSize('80%', '80%')
      .afterClosed().subscribe((results)=>{

      });
  }

}
