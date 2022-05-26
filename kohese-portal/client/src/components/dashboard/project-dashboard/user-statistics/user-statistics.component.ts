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


// Angular
import { Component, OnInit, Input, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { MatOption } from '@angular/material/core';
import { MatTableDataSource } from '@angular/material/table';
import { Sort } from '@angular/material/sort';
import { FormControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Subscription, Observable } from 'rxjs';

// Other External Dependencies

// Kohese
import { ProjectInfo } from '../../../../services/project-service/project.service';
import { ItemProxy } from '../../../../../../common/src/item-proxy';
import { NavigatableComponent } from '../../../../classes/NavigationComponent.class';
import { NavigationService } from '../../../../services/navigation/navigation.service';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { DetailsComponent } from '../../../details/details.component';
import { StateInfo, StateFilterService } from '../../state-filter.service';

@Component({
  selector: 'user-statistics',
  templateUrl: './user-statistics.component.html',
  styleUrls: ['./user-statistics.component.scss']
})
export class UserStatisticsComponent extends NavigatableComponent
  implements OnInit, AfterViewInit, OnDestroy {

  @Input()
  projectStream: Observable<ProjectInfo>;
  projectStreamSub: Subscription;
  project: ProjectInfo;

  selectedUserMap: Map<string, ItemProxy> = new Map<string, ItemProxy>();
  selectedAssignments: Array<any>;
  sortedData: Array<any>;
  tableStream: MatTableDataSource<ItemProxy>;
  rowDef = ['assignedTo', 'name', 'state', 'kind', 'due'];

  useStates : boolean = false;
  supportedTypes = ['Action', 'Task', 'Decision'];
  stateInfo : {} = {};
  selectedStatesMap : Map<string, StateInfo> = new Map<string, StateInfo>([]);
  matchingObjects : Array<any> = [];
  origin : string;

  selectAllToggled: boolean = false;
  numberOfItemsSelected: number;
  totalNumberOfUsers: number;
  includeUnassigned: boolean = false;
  unassigned: Array<ItemProxy> = [];
  @ViewChild('unassignedOption') private unassignedOption: MatOption
  @ViewChild('selectAll') private selectAll: MatOption

  userControl: FormControl = new FormControl();
  stateControl: FormControl = new FormControl();
  enabledStates: Array<any> = [];

  constructor(
              protected navigationService: NavigationService,
              protected dialogService: DialogService,
              private stateFilterService : StateFilterService,
              private title : Title,
  ) {
    super(navigationService)
  }

  ngOnInit() {
    this.origin = location.origin + '/explore;id=';
    this.projectStreamSub = this.projectStream.subscribe((newProject) => {
      if (newProject) {
        this.project = newProject;
        let projectTitle = this.project.proxy.item.name;
        this.title.setTitle('User Statistics | ' + projectTitle);
        this.stateInfo = this.stateFilterService.getStateInfoFor(this.supportedTypes);
      }
    });
    // this.userControl = new FormControl(this.project.users);
  }

  ngAfterViewInit() {
    this.toggleAllUsers();
  }

  ngOnDestroy() {
    this.projectStreamSub.unsubscribe();
  }

  toggleUser(user: ItemProxy) {
    // Determine if user needs to be added or removed from the selected list
    this.selectedAssignments = [];

    if (this.selectedUserMap.get(user.item.name)) {
      this.selectedUserMap.delete(user.item.name);
    } else {
      this.selectedUserMap.set(user.item.name, user);
    }

    this.numberOfItemsSelected = this.userControl.value.length;
    this.totalNumberOfUsers = this.project.users.length + 1;
    if(this.numberOfItemsSelected === this.totalNumberOfUsers) {
      this.selectAllToggled = true;
      this.selectAll.select();
    } else {
      this.selectAllToggled = false;
      this.selectAll.deselect();
    }

    this.buildSelectedAssignments();
  }

  toggleAllUsers() {
    this.selectAllToggled = !this.selectAllToggled;
    if(this.selectAllToggled) {
      for (let idx in this.project.users) {
        let user = this.project.users[idx];
        this.selectedUserMap.set(user.item.name, user);
      }

      this.userControl.patchValue([...this.project.users.map(item => item)]);
      this.unassignedOption.select();
      this.buildSelectedAssignments();
    } else {
      this.resetUsers();
    }
  }

  resetUsers() {
    this.unassigned = [];
    this.includeUnassigned = false;
    this.selectedUserMap.clear();
    this.userControl.reset('');
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
      });
    }

    if(this.selectedStatesMap.size > 0) {
      this.useStates = true;
    } else {
      this.useStates = false;
    }
    this.buildSelectedAssignments();
  }

  resetStates() {
    this.useStates = false;
    this.selectedStatesMap.clear();
    this.stateControl.reset();
    this.buildSelectedAssignments();
  }

  buildSelectedAssignments() {
    this.selectedAssignments = [];

    // includes project items with user relations
    Array.from(this.selectedUserMap.values(), (user: ItemProxy) => {
      for (let kind in user.relations.referencedBy) {
        for (let assignmentIdx in user.relations.referencedBy[kind].assignedTo) {
          let assignment = user.relations.referencedBy[kind].assignedTo[assignmentIdx];
          let match = false;
          for (let projectIdx in this.project.projectItems) {
            match = assignment.hasAncestor(this.project.projectItems[projectIdx]);
            if (match) {
              break;
            }
          }

          if (match) {
            this.selectedAssignments.push(
              user.relations.referencedBy[kind].assignedTo[assignmentIdx]
            );
            continue;
          }
        }
      }
    });

    // includes project items with no user relations
    if(this.includeUnassigned) {
      for(let projectIdx of this.project.projectItems) {
        if(projectIdx.children) {
          for (let projectItem of projectIdx.children) {
            this.hasUnassignedChildren(projectItem);
          }
        }
        if(!projectIdx.item.assignedTo &&
          (projectIdx.kind === 'Task' || projectIdx.kind === 'Action' || projectIdx.kind === 'Decision')) {

          this.unassigned.push(projectIdx);
        }
      }
    } else {
      this.unassigned = [];
    }
    if(this.includeUnassigned && this.unassigned.length > 0) {
      this.findDuplicates(this.unassigned);
      for(let proxy of this.unassigned) {
        this.selectedAssignments.push(proxy);
      }
    }

    // filters each project item against all selected states
    // and prunes selected assignments appropriately
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
      });
    }

    this.tableStream = new MatTableDataSource<ItemProxy>(this.selectedAssignments);
  }

  hasUnassignedChildren(proxy: ItemProxy) {
    if(!proxy.item.assignedTo &&
        (proxy.kind === 'Task' || proxy.kind === 'Action' || proxy.kind === 'Decision')) {

      this.unassigned.push(proxy);
    }
    if(proxy.children) {
      for(let child of proxy.children) {
        if(!child.item.assignedTo &&
            (child.kind === 'Task' || child.kind === 'Action' || child.kind === 'Decision')) {
          this.unassigned.push(child);
        }
        this.hasUnassignedChildren(child);
      }
    }
  }

  findDuplicates(arr: Array<ItemProxy>) {
    arr.filter((item,index) => {
      if(arr.indexOf(item) != index) {
        this.unassigned.splice(index,1);
      }
    });
  }

  // TODO: Implement when a multi-optgroup patchValue solution has been found
  allStates: Array<any> = [];
  selectAllStates() {
    this.resetStates();
    for(let type of this.supportedTypes) {
      for(let stateType in this.stateInfo[type]) {
        for(let state of this.stateInfo[type][stateType].states) {
          this.toggleState(type, stateType, state);
        }
      }
    }
    this.buildSelectedAssignments();
  }

  openProxyDetails(proxy: ItemProxy) {
    this.dialogService.openComponentDialog(DetailsComponent, {
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
      let htmlString = '';
      let textString = '';
      htmlString =
        '<table>\n' +
        '  <thead>\n' +
        '    <tr>\n' +
        '      <th>Id</th>\n' +
        '      <th>Name</th>\n' +
        '      <th>Kind</th>\n' +
        '      <th>State</th>\n' +
        '      <th>Assigned To</th>\n' +
        '    </tr>\n' +
        '  </thead>\n' +
        '  <tbody>';
      for (let item of items) {
        htmlString +=
          '  <tr>\n' +
          '    <td><a href="' + this.origin + item.item.id + '">' + item.item.id + '</a></td>\n' +
          '    <td>' + item.item.name  + '</td>\n' +
          '    <td>' + item.kind + '</td>\n' +
          '    <td>' + item.state + '</td>\n' +
          '    <td>' + (item.item.assignedTo ? item.item.assignedTo : 'unassigned') + '</td>\n' +
          '  </tr>\n';
        textString += 'Id: ' + item.item.id + '\n' +
                      'Name: ' + item.item.name  + '\n' +
                      'Kind: ' + item.kind + '\n' +
                      'State: ' + item.state + '\n' +
                      'Assigned To: ' + item.item.assignedTo + '\n\n'
      }
      htmlString +=
        '  </tbody>\n' +
        '</table>\n'
      e.clipboardData.setData('text/html', (htmlString));
      e.clipboardData.setData('text/plain', (textString));
      e.preventDefault();
      document.removeEventListener('copy', null);
    });
    document.execCommand('copy');
  }

  sortData(sort: Sort) {
    let data: Array<any> = [];
    data = this.selectedAssignments.slice();

    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      this.tableStream = new MatTableDataSource<ItemProxy>(this.sortedData);
      return;
    }

    this.sortedData = data.sort( (a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'assignedTo':
          return this.compareItems(a.item.assignedTo, b.item.assignedTo, isAsc);
        case 'name':
          return this.compareItems(a.item.name, b.item.name, isAsc);
        case 'state':
          return this.compareItems(a.state, b.state, isAsc);
        case 'kind':
          return this.compareItems(a.kind, b.kind, isAsc);
        case 'due':
          return this.compareItems(a.item.estimatedCompletion, b.item.estimatedCompletion, isAsc);
        default:
          return 0;
      }
    });

    this.tableStream = new MatTableDataSource<ItemProxy>(this.sortedData);
  }

  private compareItems(itemA: any, itemB: any, isAsc: boolean): number {
    let retVal: number = 0;
    if (itemA && itemB) {
      if (itemA > itemB) retVal = 1;
      else if (itemA < itemB) retVal = -1;
    }
    else if (itemA) retVal = 1;
    else if (itemB) retVal = -1;
    return retVal * (isAsc ? 1 : -1);
  }
}
