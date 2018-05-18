import { Observable } from 'rxjs/Observable';
import { ProjectInfo } from './../../../../services/project-service/project.service';
import { Subscription } from 'rxjs';
import { Input } from '@angular/core';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'status-dashboard',
  templateUrl: './status-dashboard.component.html',
  styleUrls: ['./status-dashboard.component.scss']
})
export class StatusDashboardComponent implements OnInit, OnDestroy {
  @Input()
  projectStream: Observable<ProjectInfo>;
  projectStreamSub: Subscription;
  project : ProjectInfo;

  constructor() { }

  ngOnInit() {
    this.projectStreamSub = this.projectStream.subscribe((newProject) => {
      if (newProject) {
        this.project = newProject;
        console.log(this.project);
      }
    })
  }

  ngOnDestroy() {
    this.projectStreamSub.unsubscribe();
  }
}
