import { Component, OnInit, Input} from '@angular/core';
import { ProjectInfo } from '../project-dashboard.component';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'project-overview',
  templateUrl: './project-overview.component.html',
  styleUrls: ['./project-overview.component.scss']
})
export class ProjectOverviewComponent implements OnInit {
  @Input()
  projectStream : Observable<ProjectInfo>;
  projectStreamSub : Subscription;
  project : ProjectInfo

  constructor() { 

  }

  ngOnInit() {

  }

}
