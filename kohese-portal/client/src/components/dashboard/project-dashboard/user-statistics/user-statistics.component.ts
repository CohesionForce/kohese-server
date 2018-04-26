import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import { ProjectInfo } from '../../../../services/project-service/project.service';
import { Subscription, Observable } from 'rxjs';

import * as ItemProxy from '../../../../../../common/src/item-proxy';
import { NavigatableComponent } from '../../../../classes/NavigationComponent.class';
import { NavigationService } from '../../../../services/navigation/navigation.service';
import { MatTableDataSource } from '@angular/material';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { DetailsDialogComponent } from '../../../details/details-dialog/details-dialog.component';

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

  selectedUserMap : Map<string, ItemProxy> = new Map<string, ItemProxy>();
  selectedAssignments : Array<any>;
  tableStream : MatTableDataSource<ItemProxy>;
  rowDef = ['kind','name','state','assignedTo']

  constructor(protected navigationService : NavigationService,
              protected dialogService : DialogService) {
    super(navigationService)
   }

  ngOnInit() {
    this.projectStreamSub = this.projectStream.subscribe((newProject)=>{
      if (newProject) {
        this.project = newProject;
        this.deselectAll();
      }
    })
  }

  ngOnDestroy() {
    this.projectStreamSub.unsubscribe();
  }

  toggleUser(user : ItemProxy) {
    // Determine if user needs to be added or removed from the selected list
    this.selectedAssignments = [];
    if (this.selectedUserMap.get(user.item.name)) {
      this.selectedUserMap.delete(user.item.name)
    } else {
      this.selectedUserMap.set(user.item.name, user);
    }
    this.buildSelectedAssignments();
  }

  selectAll () {
    for (let idx in this.project.users) {
      let user = this.project.users[idx];
      this.selectedUserMap.set(user.item.name, user);
    }
    this.buildSelectedAssignments();
  }

  deselectAll () {
    this.selectedUserMap = new Map<string, ItemProxy>();
    this.buildSelectedAssignments();
  }

  buildSelectedAssignments () {
    this.selectedAssignments = [];

    Array.from(this.selectedUserMap.values(), (user : ItemProxy) =>{
      for (let kind in user.relations.referencedBy) {
        for (let assignmentIdx in user.relations.referencedBy[kind].assignedTo) {
          this.selectedAssignments.push(
            user.relations.referencedBy[kind].assignedTo[assignmentIdx]
          )
        }
      }      
    })
    this.tableStream = new MatTableDataSource<ItemProxy>(this.selectedAssignments);
  }

  openProxyDetails(proxy: ItemProxy) {
    this.dialogService.openComponentDialog(DetailsDialogComponent, {
      data : {
        itemProxy : proxy
      }
    }).updateSize('80%', '80%')
      .afterClosed().subscribe((results)=>{

      });
  }



}
