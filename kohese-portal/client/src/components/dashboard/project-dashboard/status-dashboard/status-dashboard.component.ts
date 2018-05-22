import { DetailsDialogComponent } from './../../../details/details-dialog/details-dialog.component';
import { DialogService } from './../../../../services/dialog/dialog.service';
import { MatTableDataSource } from '@angular/material';
import { ItemProxy } from './../../../../../../common/src/item-proxy';
import { DynamicTypesService } from './../../../../services/dynamic-types/dynamic-types.service';
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

  supportedTypes : Array<string> = ['Action', 'Task', 'Decision']
  stateInfo : {} = {};
  initialized : boolean = false;

  selectedStatesMap: Map<string, StateInfo> = new Map<string, StateInfo>();
  selectedStates : Array<any> = [];
  tableStream: MatTableDataSource<ItemProxy>;
  rowDef = ['kind', 'name', 'state', 'assignedTo']

  constructor(private typeService : DynamicTypesService,
              private dialogService : DialogService) { }

  ngOnInit() {
    this.projectStreamSub = this.projectStream.subscribe((newProject) => {
      if (newProject) {
        this.project = newProject;
        console.log(this.project);

        // Get list of states to filter on
        let types = this.typeService.getKoheseTypes();
        for (let type of this.supportedTypes) {
          this.stateInfo[type] = {};
          let typeDef = types[type].dataModelProxy;
          let stateProperties = typeDef.item.stateProperties;
          for (let stateKind of stateProperties) {
            this.stateInfo[type][stateKind] = {
              states : []
            }
            let states = types[type].fields[stateKind].properties.state;
            for (let state in states) {
              this.stateInfo[type][stateKind].states.push(state);
            }
          }
          this.buildSelectedStates();
          console.log(this.stateInfo);
        }
        this.initialized = true;
      }
    })
  }

  ngOnDestroy() {
    this.projectStreamSub.unsubscribe();
  }

  toggleState(type : string, stateType : string, state : string) {
    if (this.selectedStatesMap.get(stateType + state)) {
      console.log('State deselect');
      this.selectedStatesMap.delete(stateType + state);
    } else {
      console.log('State select');
      this.selectedStatesMap.set(stateType + state, {
        type : type,
        stateType : stateType,
        state : state
      })
    }
    console.log(this.selectedStatesMap);
    this.buildSelectedStates();
  }

  buildSelectedStates () {
      this.selectedStates = [];

      for (let proxy of this.project.projectItems) {
        let newItems = proxy.getDescendants();
        this.selectedStates = this.selectedStates.concat(proxy.getDescendants())
      }

      this.selectedStates = this.selectedStates.filter((proxy)=>{
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

      // Array.from(this.selectedStatesMap.values(), (user: ItemProxy) => {
      //   for (let kind in user.relations.referencedBy) {
      //     for (let assignmentIdx in user.relations.referencedBy[kind].assignedTo) {
      //       let assignment = user.relations.referencedBy[kind].assignedTo[assignmentIdx];
      //       let match = false;
      //       for (let projectIdx in this.project.projectItems) {
      //         match = assignment.hasAncestor(this.project.projectItems[projectIdx])
      //         if (match) {
      //           break;
      //         }
      //       }

      //       if (match) {
      //         this.selectedAssignments.push(
      //           user.relations.referencedBy[kind].assignedTo[assignmentIdx]
      //         )
      //         continue;
      //       }
      //     }
      //   }
      // })
      this.tableStream = new MatTableDataSource<ItemProxy>(this.selectedStates);
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
}

interface StateInfo {
  type : string,
  stateType : string,
  state : string
}
