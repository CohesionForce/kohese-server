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
import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef,
         ViewChildren, QueryList } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MatExpansionPanel } from '@angular/material/expansion';
import { Observable, Subscription } from 'rxjs';

// Other External Dependencies

// Kohese
import { NavigationService } from '../../../services/navigation/navigation.service';
import { SessionService } from '../../../services/user/session.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { DetailsComponent } from '../../details/details.component';
import { FormatDefinitionType } from '../../../../../common/src/FormatDefinition.interface';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { DashboardSelections } from '../dashboard-selector/dashboard-selector.component';
import { FormatObjectEditorComponent } from '../../object-editor/format-object-editor/format-object-editor.component';
import { Hotkeys } from '../../../services/hotkeys/hot-key.service';
import { CurrentUserService } from '../../../services/user/current-user.service';
import { ProjectService } from '../../../services/project-service/project.service';

@Component({
  selector : 'assignment-dashboard',
  templateUrl : './assignment-dashboard.component.html',
  styleUrls : ['./assignment-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssignmentDashboardComponent implements OnInit, OnDestroy {
  // Data
  numCommentsMap = {}; //TODO: Add type definition
  currentUser : ItemProxy;
  username : string;
  treeConfigSubscription: Subscription;
  changeSubjectSubscription: Subscription;
  _saveShortcutSubscription: Subscription;
  _exitShortcutSubscription: Subscription;

  // I/O
  @Input()
  assignmentListStream : Observable<Array<ItemProxy>>;
  assignmentList : Array<ItemProxy> = [];
  sortedAssignmentList : Array<ItemProxy> = [];
  assignmentListSub : Subscription;

  assignmentType : DashboardSelections;
  assignmentTypeSub : Subscription;

  assignmentTypes = {};
  @ViewChildren(MatExpansionPanel)
  private expansionPanels: QueryList<MatExpansionPanel>;

  // Getters/Setters
  private _editableSet: Array<string> = [];
  get editableSet() {
    return this._editableSet;
  }

  get FormatDefinitionType() {
    return FormatDefinitionType;
  }

  get TreeConfiguration() {
    return TreeConfiguration;
  }

  get navigationService() {
    return this._navigationService;
  }

  private _focusedItemProxy: ItemProxy;
  get focusedItemProxy(): ItemProxy {
    return this._focusedItemProxy;
  }
  set focusedItemProxy(value: ItemProxy) {
    this._focusedItemProxy = value;
  }

  constructor(
              private _navigationService : NavigationService,
              private changeRef : ChangeDetectorRef,
              private _itemRepository : ItemRepository,
              private _dialogService : DialogService,
              private sessionService : SessionService,
              private currentUserService: CurrentUserService,
              private projectService: ProjectService,
              private itemRepository: ItemRepository,
              private hotkeys : Hotkeys,
              private title : Title
    ) {
      this.title.setTitle('Dashboard');
      this.assignmentTypes = DashboardSelections;
      console.log(this.assignmentTypes);

      // The if statements prevent erroneous firing of shortcuts while not focused on this component
      this._saveShortcutSubscription = this.hotkeys.addShortcut({ keys: 'control.s', description: 'save and continue' }).subscribe(command => {
        if(this.focusedItemProxy) {
          this.saveAndContinueEditing(this.focusedItemProxy);
        }
      });
      this._exitShortcutSubscription = this.hotkeys.addShortcut({ keys: 'escape', description: 'discard changes and exit edit mode' }).subscribe(command => {
        if(this.focusedItemProxy) {
          this.discardChanges(this.focusedItemProxy);
        }
      });
  }

  ngOnInit() {
    this.assignmentTypeSub = this.projectService.dashboardSelectionStream.subscribe((dashboardType)=>{
      this.assignmentType = dashboardType;
      this.sortedAssignmentList = this.sortAssignments(this.assignmentType, this.assignmentList);
      this.changeRef.markForCheck();
    });
    this.assignmentListSub = this.assignmentListStream.subscribe((assignmentList)=>{
      this.assignmentList = assignmentList;
      this.sortedAssignmentList = this.sortAssignments(this.assignmentType, assignmentList);
      this.changeRef.markForCheck();
    });

    this.currentUserService.getCurrentUserSubject().subscribe((userInfo) => {
      if (userInfo) {
        this.username = userInfo.username;
        this.treeConfigSubscription = this.itemRepository.getTreeConfig().subscribe((newConfig) => {
          if (newConfig) {
          this.currentUser = newConfig.config.getProxyByProperty('KoheseUser', 'username', this.username);
          }
        })
      }
    });

    // TODO: decide how to handle assignments (current and prior) on the dashboard with regard to the lenses
    this.treeConfigSubscription = TreeConfiguration.getWorkingTree().getChangeSubject().subscribe((notification: any) => {
        switch (notification.type) {
          case 'reference-added':
          case 'reference-removed':
            if(this.numCommentsMap[notification.proxy.item.id]) {
              this.checkEntries(notification.proxy);
              this.changeRef.detectChanges();
            }
            if(this.numCommentsMap[notification.referenceProxy.item.id]) {
              this.checkEntries(notification.referenceProxy);
              this.changeRef.detectChanges();
            }
            break;
          case 'create':
            this.buildAssignmentList();
            break;
          case 'update':
            this.buildAssignmentList();
            break;
          case 'delete':
            this.buildAssignmentList();
            if(this.numCommentsMap[notification.proxy.item.id]) {
              delete this.numCommentsMap[notification.proxy.item.id];
            }
            break;
        }
    });

    this._navigationService.navigate('Dashboard', {});
  }

  ngOnDestroy() {
    this.assignmentTypeSub.unsubscribe();
    this.assignmentListSub.unsubscribe();
    this._saveShortcutSubscription.unsubscribe();
    this._exitShortcutSubscription.unsubscribe();
  }

  public getViewModel(itemProxy: ItemProxy): any {
    return itemProxy.model.view.item;
  }

  public save(itemProxy: ItemProxy): void {
    this._itemRepository.upsertItem(itemProxy.kind, itemProxy.item).then(
      (returnedItemProxy: ItemProxy) => {
      this.changeRef.markForCheck();
    });
    this._editableSet.splice(this._editableSet.indexOf(itemProxy.item.id), 1);
  }

  public saveAndContinueEditing(itemProxy: ItemProxy): void {
    this._itemRepository.upsertItem(itemProxy.kind, itemProxy.item).then(
      (returnedItemProxy: ItemProxy) => {
      this.changeRef.markForCheck();
    });
  }

  public async discardChanges(itemProxy: ItemProxy): Promise<void> {
    if(itemProxy.dirty) {
      let response = await this._dialogService.openYesNoDialog('Discard Changes?', '');
      if(response === false) {
        return;
      }
      if(response === true) {
        await this._itemRepository.fetchItem(itemProxy);
        this._editableSet.splice(this._editableSet.indexOf(itemProxy.item.id), 1);
        this.checkEntries(itemProxy);
        this.changeRef.markForCheck();
      }
    } else {
      this._editableSet.splice(this._editableSet.indexOf(itemProxy.item.id), 1);
    }
  }

  public displayInformation(itemProxy: ItemProxy): void {
    this._dialogService.openComponentDialog(DetailsComponent, {
      data: {
        itemProxy: itemProxy
      }
    }).updateSize('90%', '90%');
  }

  buildAssignmentList () {
    let assignments = [];
    for(let referenceCategory in this.currentUser.relations.referencedBy) {
      for(let user in this.currentUser.relations.referencedBy[referenceCategory].assignedTo) {
        assignments.push(this.currentUser.relations.referencedBy[referenceCategory].assignedTo[user]);
      }
    }
    this.sortedAssignmentList = this.sortAssignments(this.assignmentType, assignments);
    this.changeRef.detectChanges();
  }

  sortAssignments(sortStrategy : DashboardSelections, assignmentList : Array<ItemProxy>) {
    let sortedArray = [];
    switch (sortStrategy) {
      /////////////////
      case (DashboardSelections.DUE_ASSIGNMENTS) :
        sortedArray = assignmentList.filter((assignment)=>{
          return (!this.isCompleted(assignment) && assignment.item.estimatedCompletion)
        }).sort((a, b)=>{
          if (a.item.estimatedCompletion <= b.item.estimatedCompletion) {
            return -1;
          } else {
            return 1;
          }
        })
        break;
      /////////////////
      case (DashboardSelections.OPEN_ASSIGNMENTS) :
        sortedArray = assignmentList.filter((assignment)=>{
          return (!this.isCompleted(assignment))
        }).sort((a, b)=>{
          if (a.item.modifiedOn >= b.item.modifiedOn) {
            return 1;
          } else {
            return -1;
          }
        })
        break;
      /////////////////
      case (DashboardSelections.COMPLETED_ASSIGNMENTS) :
        sortedArray = assignmentList.filter((assignment)=>{
         return (this.isCompleted(assignment))
        }).sort((a, b)=>{
          if (a.item.modifiedOn >= b.item.modifiedOn) {
            return 1;
          } else {
            return -1;
          }
        })
        break;
      ////// This should never happen
      default :
        sortedArray = assignmentList;
        console.warn('Invalid Assignment Sort Strategy')

    }
    return sortedArray;
  }

  ////////////////////////////////////////////////////////////////////
  // Determines which items are valid for
  // DashboardSelections.COMPLETED_ASSIGNMENTS
  ////////////////////////////////////////////////////////////////////
  isCompleted(assignment : ItemProxy) : boolean {
    let types: Array<string> = [];
    let kindProxy: ItemProxy = TreeConfiguration.getWorkingTree().getProxyFor(
      assignment.kind);
    while (kindProxy) {
      types.push(kindProxy.item.name);
      kindProxy = TreeConfiguration.getWorkingTree().getProxyFor(kindProxy.
        item.base);
    }

    if (types.indexOf('Task') !== -1) {
      if (assignment.item.taskState === 'Completed') {
        return true;
      }
    } else if (types.indexOf('Action') !== -1) {
      if (assignment.item.actionState === 'Verified' ||
          assignment.item.actionState === 'Closed') {
          return true
        }
    }
    return false;
  }


  getHeader(itemProxy: ItemProxy): string {
    let viewModel: any = this.getViewModel(itemProxy);
    let formatDefinitionId: string = viewModel.defaultFormatKey[FormatDefinitionType.CARD];
    if(formatDefinitionId == null) {
      formatDefinitionId = viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT];
    }
    this.checkEntries(itemProxy);
    this.changeRef.markForCheck();
    return viewModel.formatDefinitions[formatDefinitionId].header.contents[0].propertyName;
  }

  ////////////////////////////////////////////////////////////////////
  // Counts Observations/Issues on an item.
  // used to display the number of entries and determine which
  // dialog to display
  ////////////////////////////////////////////////////////////////////
  public checkEntries(assignment: ItemProxy) {
    this.numCommentsMap[assignment.item.id] = 0;

    let observationRelation = assignment.relations.referencedBy.Observation;
    let issueRelation = assignment.relations.referencedBy.Issue;

    if(observationRelation && observationRelation.context) {
      this.numCommentsMap[assignment.item.id] += observationRelation.context.length;
    }
    if(issueRelation && issueRelation.context) {
      this.numCommentsMap[assignment.item.id] += issueRelation.context.length;
    }
  }

  ////////////////////////////////////////////////////////////////////
  //  opens to the journal tab if comments are present
  ////////////////////////////////////////////////////////////////////
  public displayJournal(itemProxy: ItemProxy): void {
    this._dialogService.openComponentDialog(DetailsComponent, {
      data: {
        itemProxy: itemProxy,
        startWithJournal: true
      }
    }).updateSize('90%', '90%');
  }

  ////////////////////////////////////////////////////////////////////
  // Opens a dialog to add a journal entry with pre-filled data if
  // no comments are present
  ////////////////////////////////////////////////////////////////////
  public addEntry(assignment: ItemProxy): void {
    let username: string = this.sessionService.user.name;
    let timestamp: number = Date.now();
    this._dialogService.openComponentDialog(FormatObjectEditorComponent, {
      data: {
        type: TreeConfiguration.getWorkingTree().getProxyFor('Observation').item,
        object: {
          createdOn: timestamp,
          createdBy: username,
          modifiedOn: timestamp,
          modifiedBy: username,
          parentId: assignment.item.id,
          context: [{ id: assignment.item.id }],
          observedBy: username,
          observedOn: timestamp
        },
        formatDefinitionType: FormatDefinitionType.DEFAULT,
        allowKindChange: true
      }
    }).updateSize('90%', '90%').afterClosed().subscribe(async (result: any) => {
      if (result) {
        await this._itemRepository.upsertItem(result.type.name, result.object);
        this.checkEntries(assignment);
        this.changeRef.markForCheck();
      }
    });

  }

  public expandAll(): void {
    let expansionPanels: Array<MatExpansionPanel> = this.expansionPanels.toArray();
    for (let j: number = 0; j < expansionPanels.length; j++) {
      expansionPanels[j].open();
    }
  }

  public collapseAll(): void {
    let expansionPanels: Array<MatExpansionPanel> = this.expansionPanels.toArray();
    for (let j: number = 0; j < expansionPanels.length; j++) {
      expansionPanels[j].close();
    }
  }

}
