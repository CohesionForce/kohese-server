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


import { Component, OnInit } from '@angular/core';

import { ProjectInfo, ProjectService } from '../../../../services/project-service/project.service';

import { ItemProxy} from '../../../../../../common/src/item-proxy';
import { MatDialogRef } from '@angular/material';



@Component({
  selector: 'project-selector',
  templateUrl: './project-selector.component.html',
  styleUrls: ['./project-selector.component.scss']
})
export class ProjectSelectorComponent implements OnInit {

  isMultiSelect : boolean // unused as of right now
  projectList : Array<ProjectInfo>;
  selectedProject : ProjectInfo;
  historicalMode : boolean;

  constructor(private dialogRef : MatDialogRef<ProjectSelectorComponent>,
              private projectService : ProjectService) {

               }

  ngOnInit() {
    this.projectList = this.projectService.getProjects();
    this.historicalMode = this.projectService.isHistorical();

  }

  closeDialog () {
    this.dialogRef.close()
  }

  selectProject (selectedProject : ProjectInfo) {
    this.selectedProject = selectedProject
  }

  confirmProject () {
    this.dialogRef.close(this.selectedProject);
  }

  toggleCurrentProjects (checked) {
    console.log(checked);
    if (checked) {
      this.projectList = this.projectService.generateWorkingProjects();
    } else {
      this.projectList = this.projectService.getProjects();
    }
  }
}
