import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ProjectInfo } from '../project-dashboard.component';
import { Subscription, Observable } from 'rxjs';

import * as ItemProxy from '../../../../../../common/src/item-proxy';
import { NavigatableComponent } from '../../../../classes/NavigationComponent.class';
import { NavigationService } from '../../../../services/navigation/navigation.service';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'user-statistics',
  templateUrl: './user-statistics.component.html',
  styleUrls: ['./user-statistics.component.scss']
})
export class UserStatisticsComponent extends NavigatableComponent implements OnInit, OnDestroy {

  @Input() 
  projectStream : Observable<ProjectInfo>;
  projectStreamSub : Subscription;
  project : ProjectInfo;

  selectedUser : ItemProxy;
  selectedAssignments : Array<any>;
  tableStream : MatTableDataSource<ItemProxy>;
  rowDef = ['kind','name','state','assignedTo']

  constructor(protected navigationService : NavigationService) {
    super(navigationService)
   }

  ngOnInit() {
    this.projectStreamSub = this.projectStream.subscribe((newProject)=>{
      if (newProject) {
        this.project = newProject;
        console.log(this);
      }
    })
  }

  ngOnDestroy() {
    this.projectStreamSub.unsubscribe();
  }

  selectUser(user : ItemProxy) {
    this.selectedAssignments = [];
    this.selectedUser = user;
    for (let kind in user.relations.referencedBy) {
      for (let assignmentIdx in user.relations.referencedBy[kind].assignedTo) {
        this.selectedAssignments.push(
          user.relations.referencedBy[kind].assignedTo[assignmentIdx]
        )
      }
    }
    this.tableStream = new MatTableDataSource<ItemProxy>(this.selectedAssignments);

    console.log(this);
  }

}
