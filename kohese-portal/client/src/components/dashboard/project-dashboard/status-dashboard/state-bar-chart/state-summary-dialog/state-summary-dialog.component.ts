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
import { Component, OnInit, OnDestroy, Input, Inject, ViewChild, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { Subscription } from 'rxjs';

// Other External Dependencies

// Kohese
import { ItemRepository } from '../../../../../../services/item-repository/item-repository.service';
import { NavigationService } from '../../../../../../services/navigation/navigation.service';
import { DialogService } from '../../../../../../services/dialog/dialog.service';
import { SessionService } from '../../../../../../services/user/session.service';
import { DetailsComponent } from '../../../../../details/details.component';
import { FormatDefinitionType } from '../../../../../../../../common/src/FormatDefinition.interface';
import { ItemProxy } from './../../../../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../../../../common/src/tree-configuration';
import { FormatObjectEditorComponent } from '../../../../../object-editor/format-object-editor/format-object-editor.component';
import { Hotkeys } from '../../../../../../services/hotkeys/hot-key.service';
import { CreateWizardComponent } from '../../../../../create-wizard/create-wizard.component';

@Component({
  selector: 'state-summary-dialog',
  templateUrl: './state-summary-dialog.component.html',
  styleUrls: ['./state-summary-dialog.component.scss']
})
export class StateSummaryDialogComponent implements OnInit, OnDestroy {

  // Data
  numCommentsMap = {};
  treeConfigSubscription: Subscription;
  changeSubjectSubscription: Subscription;
  _saveShortcutSubscription: Subscription;
  _exitShortcutSubscription: Subscription;

  private _proxies: Array<ItemProxy>;
  get proxies() {
    return this._proxies;
  }
  @Input('proxies')
  set proxies(proxies: Array<ItemProxy>) {
    this._proxies = proxies;
  }

  @ViewChild('proxyTable') table;
  color;

  private _kindName: string;
  get kindName() {
    return this._kindName;
  }
  @Input('kindName')
  set kindName(kindName: string) {
    this._kindName = kindName;
  }

  private _stateName: string;
  get stateName() {
    return this._stateName;
  }
  @Input('stateName')
  set stateName(stateName: string) {
    this._stateName = stateName;
  }

  private _editableSet: Array<string> = [];
  get editableSet() {
    return this._editableSet;
  }

  private _focusedItemProxy: ItemProxy;
  get focusedItemProxy(): ItemProxy {
    return this._focusedItemProxy;
  }
  set focusedItemProxy(item: ItemProxy) {
    this._focusedItemProxy = item;
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

  @ViewChildren(MatExpansionPanel)
  private expansionPanels: QueryList<MatExpansionPanel>;

  constructor(
              @Inject(MAT_DIALOG_DATA) private data: any,
              private _itemRepository: ItemRepository,
              private _navigationService: NavigationService,
              private _dialogService: DialogService,
              private sessionService: SessionService,
              private changeRef : ChangeDetectorRef,
              private hotkeys: Hotkeys
  ) {
    if (this.data) {
      this._proxies = data.proxies;
      this._kindName = data.kindName;
      this._stateName = data.stateName;
      this.color = TreeConfiguration.getWorkingTree().getModelProxyFor(this._kindName).view.item.color;

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
  }

  ngOnInit(): void {
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
        case 'update':
          if(notification.proxy.state === this.stateName) {
            if(!this.proxies.includes(notification.proxy)) {
              this.proxies.push(notification.proxy);
            }
          } else {
            if(this.proxies.includes(notification.proxy)) {
              this.proxies.splice(this.proxies.indexOf(notification.proxy),1);
            }
          }
          // this.changeRef.detectChanges();
          break;
        case 'delete':
          if(this.numCommentsMap[notification.proxy.item.id]) {
            delete this.numCommentsMap[notification.proxy.item.id];
          }
          break;
      }
  });
  }

  ngOnDestroy(): void {
    if(this._saveShortcutSubscription) {
      this._saveShortcutSubscription.unsubscribe();
    }
    if(this._exitShortcutSubscription) {
      this._exitShortcutSubscription.unsubscribe();
    }
  }

  toggleExpandRow(row) {
    console.log('Toggled Expand Row!', row);
    this.table.rowDetail.toggleExpandRow(row);
  }

  public getViewModel(itemProxy: ItemProxy): any {
    return itemProxy.model.view.item;
  }

  public addItem(proxy: ItemProxy) {
    this._dialogService.openComponentDialog(CreateWizardComponent, {
      data: {
        parentId: proxy.item.id
      }
    }).updateSize('90%', '90%');
  }

  public async save(itemProxy: ItemProxy): Promise<void> {
    await this._itemRepository.upsertItem(itemProxy.kind, itemProxy.item);
    this._editableSet.splice(this._editableSet.indexOf(itemProxy.item.id), 1);
  }

  public async saveAndContinueEditing(itemProxy: ItemProxy): Promise<void> {
    await this._itemRepository.upsertItem(itemProxy.kind, itemProxy.item);
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
    }).updateSize('80%', '80%');
  }

  public getHeader(itemProxy: ItemProxy): string {
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
  public checkEntries(row: ItemProxy) {
    this.numCommentsMap[row.item.id] = 0;

    let observationRelation = row.relations.referencedBy.Observation;
    let issueRelation = row.relations.referencedBy.Issue;

    if(observationRelation && observationRelation.context) {
      this.numCommentsMap[row.item.id] += observationRelation.context.length;
    }
    if(issueRelation && issueRelation.context) {
      this.numCommentsMap[row.item.id] += issueRelation.context.length;
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
      }
      this.checkEntries(assignment);
      this.changeRef.markForCheck();
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
