import { Component, OnInit, Input, OnDestroy} from '@angular/core';
import { ProjectInfo } from '../../../../services/project-service/project.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'project-overview',
  templateUrl: './project-overview.component.html',
  styleUrls: ['./project-overview.component.scss']
})
export class ProjectOverviewComponent implements OnInit, OnDestroy {
  @Input()
  projectStream : Observable<ProjectInfo>;
  projectStreamSub : Subscription;
  project : ProjectInfo

  constructor() { 

  }

  ngOnInit() {
    this.projectStreamSub = this.projectStream.subscribe((newProject)=>{
      if (newProject) {
        this.project = newProject;
        console.log(this);
      }
    })
  }

  ngOnDestroy () {
    this.projectStreamSub.unsubscribe();
  }

}
