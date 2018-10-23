import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import { ProjectInfo } from '../../../../services/project-service/project.service';
import { Subscription, Observable } from 'rxjs';

import { ItemProxy } from '../../../../../../common/src/item-proxy';
import { NavigatableComponent } from '../../../../classes/NavigationComponent.class';
import { NavigationService } from '../../../../services/navigation/navigation.service';
import { MatTableDataSource } from '@angular/material';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { DetailsDialogComponent } from '../../../details/details-dialog/details-dialog.component';
import { StateInfo, StateFilterService } from '../../state-filter.service';

@Component({
  selector: 'user-statistics',
  templateUrl: './user-statistics.component.html',
  styleUrls: ['./user-statistics.component.scss']
})
export class UserStatisticsComponent extends NavigatableComponent implements OnInit, OnDestroy {

  @Input()
  projectStream: Observable<ProjectInfo>;
  projectStreamSub: Subscription;
  project: ProjectInfo;

  selectedUserMap: Map<string, ItemProxy> = new Map<string, ItemProxy>();
  selectedAssignments: Array<any>;
  tableStream: MatTableDataSource<ItemProxy>;
  rowDef = ['kind', 'name', 'state', 'assignedTo']

  useStates : boolean = false;
  supportedTypes = ['Action', 'Task', 'Decision']
  stateInfo : {} = {};
  selectedStatesMap : Map<string, StateInfo> = new Map<string, StateInfo>([]);
  origin : string;

  constructor(protected navigationService: NavigationService,
    protected dialogService: DialogService,
    private stateFilterService : StateFilterService) {
    super(navigationService)
  }

  ngOnInit() {
    this.origin = location.origin + '/explore;id='
    this.projectStreamSub = this.projectStream.subscribe((newProject) => {
      if (newProject) {
        this.project = newProject;
        this.deselectAll();
        this.stateInfo = this.stateFilterService.getStateInfoFor(this.supportedTypes);
      }
    })
  }

  ngOnDestroy() {
    this.projectStreamSub.unsubscribe();
  }

  toggleUser(user: ItemProxy) {
    // Determine if user needs to be added or removed from the selected list
    this.selectedAssignments = [];
    if (this.selectedUserMap.get(user.item.name)) {
      this.selectedUserMap.delete(user.item.name)
    } else {
      this.selectedUserMap.set(user.item.name, user);
    }
    this.buildSelectedAssignments();
  }

  toggleState(type : string, stateType : string, state : string) {
    if (this.selectedStatesMap.get(stateType + state)) {
      this.selectedStatesMap.delete(stateType + state);
    } else {
      this.selectedStatesMap.set(stateType + state, {
        type : type,
        stateType : stateType,
        state : state
      })
    }
    this.buildSelectedAssignments();
  }

  selectAll() {
    for (let idx in this.project.users) {
      let user = this.project.users[idx];
      this.selectedUserMap.set(user.item.name, user);
    }
    this.buildSelectedAssignments();
  }

  deselectAll() {
    this.selectedUserMap = new Map<string, ItemProxy>();
    this.buildSelectedAssignments();
  }

  buildSelectedAssignments() {
    this.selectedAssignments = [];

    Array.from(this.selectedUserMap.values(), (user: ItemProxy) => {
      for (let kind in user.relations.referencedBy) {
        for (let assignmentIdx in user.relations.referencedBy[kind].assignedTo) {
          let assignment = user.relations.referencedBy[kind].assignedTo[assignmentIdx];
          let match = false;
          for (let projectIdx in this.project.projectItems) {
            match = assignment.hasAncestor(this.project.projectItems[projectIdx])
            if (match) {
              break;
            }
          }

          if (match) {
            this.selectedAssignments.push(
              user.relations.referencedBy[kind].assignedTo[assignmentIdx]
            )
            continue;
          }
        }
      }
    })

    if (this.useStates) {
      this.selectedAssignments = this.selectedAssignments.filter((proxy)=>{
        for (let stateKind of proxy.model.item.stateProperties) {
          let string = stateKind + proxy.item[stateKind];
          if (this.selectedStatesMap.get(string)){
            return true
          } else {
            continue;
          }
        }
        return false;
      })
    }

    this.tableStream = new MatTableDataSource<ItemProxy>(this.selectedAssignments);
  }

  openProxyDetails(proxy: ItemProxy) {
    this.dialogService.openComponentDialog(DetailsDialogComponent, {
      data: {
        itemProxy: proxy
      }
    }).updateSize('80%', '80%')
      .afterClosed().subscribe((results) => {

      });
  }

  copyToClipboard(items) {
    document.addEventListener('copy', (e: ClipboardEvent) => {
      console.log(items, e);
      let string = "";
      for (let item of items) {
        let newString = "Id: " + '<a href="' + this.origin + item.item.id + '">' + item.item.id + '</a><br/>' +
                        "Name: " + item.item.name  + "<br/>" +
                        "Kind: " + item.kind + "<br/>" +
                        "State: " + item.state + "<br/>" +
                        "Assigned To: " + item.item.assignedTo + "<br/><br/>"
        string += newString;
      }
      console.log(string);
      e.clipboardData.setData('text/html', (string));
      e.preventDefault();
      document.removeEventListener('copy', null);
    });
    document.execCommand('copy');
  }
}
