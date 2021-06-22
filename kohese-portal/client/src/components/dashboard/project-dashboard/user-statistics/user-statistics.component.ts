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
import { Subscription, Observable } from 'rxjs';

import { ItemProxy } from '../../../../../../common/src/item-proxy';
import { NavigatableComponent } from '../../../../classes/NavigationComponent.class';
import { NavigationService } from '../../../../services/navigation/navigation.service';
import { MatTableDataSource } from '@angular/material';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { DetailsComponent } from '../../../details/details.component';
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
          '    <td>' + item.item.assignedTo + '</td>\n' +
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
}
