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
