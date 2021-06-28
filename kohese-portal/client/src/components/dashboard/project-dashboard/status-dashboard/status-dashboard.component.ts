// Angular
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { Title } from '@angular/platform-browser';

// NPM
import { Observable ,  Subscription } from 'rxjs';

// Kohese
import { StateInfo, StateFilterService } from '../../state-filter.service';
import { DetailsComponent } from './../../../details/details.component';
import { DialogService } from './../../../../services/dialog/dialog.service';
import { ItemProxy } from './../../../../../../common/src/item-proxy';
import { DynamicTypesService } from './../../../../services/dynamic-types/dynamic-types.service';
import { ProjectInfo } from './../../../../services/project-service/project.service';
import { StateService } from '../../../../services/state/state.service';

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
  matchingObjects : Array<any> = [];
  tableStream: MatTableDataSource<ItemProxy>;
  rowDef = ['kind', 'name', 'state', 'assignedTo']

  constructor(
    private typeService : DynamicTypesService,
    private dialogService : DialogService,
    private stateFilterService : StateFilterService,
    private title : Title
    ) {}

  ngOnInit() {
    this.projectStreamSub = this.projectStream.subscribe((newProject) => {
      if (newProject) {
        this.project = newProject;
        let projectTitle: string = this.project.proxy.item.name;
        this.title.setTitle('Project Status | ' + projectTitle);
        console.log(this.project);

        this.stateInfo = this.stateFilterService.getStateInfoFor(this.supportedTypes);

        // Get list of states to filter on
        this.buildSelectedStates();
        }
        this.initialized = true;

    })
  }

  ngOnDestroy() {
    this.projectStreamSub.unsubscribe();
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
    this.buildSelectedStates();
  }

  buildSelectedStates () {
      this.matchingObjects = [];

      for (let proxy of this.project.projectItems) {
        let newItems = proxy.getDescendants();
        this.matchingObjects = this.matchingObjects.concat(proxy);
        this.matchingObjects = this.matchingObjects.concat(proxy.getDescendants())
      }

      this.matchingObjects = this.matchingObjects.filter((proxy)=>{
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
      this.tableStream = new MatTableDataSource<ItemProxy>(this.matchingObjects);
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
}


