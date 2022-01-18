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
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input,
         OnDestroy, ViewChildren, QueryList } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';

// Other External Dependencies

// Kohese
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { SessionService } from '../../../services/user/session.service';
import { FormatDefinitionType } from '../../../../../common/src/FormatDefinition.interface';
import { FormatObjectEditorComponent } from '../../object-editor/format-object-editor/format-object-editor.component';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { DetailsComponent } from '../details.component';
import { Hotkeys } from '../../../services/hotkeys/hot-key.service';
import { Subscription } from 'rxjs';

// TODO: Change Component to use selectedOrdering instead of exporting enumeration with Ordering getter
export enum JournalOrdering {
  ELDEST_FIRST_WHEN_OBSERVED = 'Eldest First When Observed',
    ELDEST_LAST_WHEN_OBSERVED = 'Eldest Last When Observed',
    ELDEST_FIRST_JOURNAL_ENTRY_MADE = 'Eldest First Journal Entry Made',
    ELDEST_LAST_JOURNAL_ENTRY_MADE = 'Eldest Last Journal Entry Made',
    OBSERVER = 'Observer',
    JOURNAL_ENTRY_MAKER = 'Journal Entry Maker',
    ISSUES_FIRST = 'Issues First', ISSUES_LAST = 'Issues Last'
}

@Component({
  selector: 'journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JournalComponent implements OnDestroy {

  _saveShortcutSubscription: Subscription;
  _exitShortcutSubscription: Subscription;

  private _itemProxy: ItemProxy;
  get itemProxy() {
    return this._itemProxy;
  }
  @Input('itemProxy')
  set itemProxy(itemProxy: ItemProxy) {
    this._itemProxy = itemProxy;
  }

  private _selectedParentId: string = '';
  get selectedParentId() {
    return this._selectedParentId;
  }
  set selectedParentId(selectedParentId: string) {
    this._selectedParentId = selectedParentId;
  }

  private _additionalContextIds: Array<string> = [];
  get additionalContextIds() {
    return this._additionalContextIds;
  }

  private _selectedOrdering: JournalOrdering = JournalOrdering.ELDEST_FIRST_WHEN_OBSERVED;
  get selectedOrdering() {
    return this._selectedOrdering;
  }
  set selectedOrdering(selectedOrdering: JournalOrdering) {
    this._selectedOrdering = selectedOrdering;
  }

  private _filterTimeoutIdentifier: any;

  private _editableSet: Array<string> = [];
  get editableSet() {
    return this._editableSet;
  }

  get Ordering() {
    return JournalOrdering;
  }

  get FormatDefinitionType() {
    return FormatDefinitionType;
  }

  get TreeConfiguration() {
    return TreeConfiguration;
  }

  get Object() {
    return Object;
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

  @ViewChildren(MatExpansionPanel)
  private expansionPanels: QueryList<MatExpansionPanel>;

  public constructor(private _changeDetectorRef: ChangeDetectorRef,
                     private _itemRepository: ItemRepository,
                     private _dialogService: DialogService,
                     private _navigationService: NavigationService,
                     private _sessionService: SessionService,
                     private hotkeys: Hotkeys
  ) {
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

  ngOnDestroy(): void {
    this._saveShortcutSubscription.unsubscribe();
    this._exitShortcutSubscription.unsubscribe();
  }

  public addEntry(): void {
    let username: string = this._sessionService.user.name;
    let timestamp: number = Date.now();
    this._dialogService.openComponentDialog(FormatObjectEditorComponent, {
      data: {
        type: TreeConfiguration.getWorkingTree().getProxyFor('Observation').
          item,
        object: {
          createdOn: timestamp,
          createdBy: username,
          modifiedOn: timestamp,
          modifiedBy: username,
          parentId: this._itemProxy.item.id,
          context: [{ id: this._itemProxy.item.id }],
          observedBy: username,
          observedOn: timestamp
        },
        formatDefinitionType: FormatDefinitionType.DEFAULT,
        allowKindChange: true
      }
    }).updateSize('90%', '90%').afterClosed().subscribe(async (result:
      any) => {
      if (result) {
        await this._itemRepository.upsertItem(result.type.name, result.object);
        this._changeDetectorRef.markForCheck();
      }
    });
  }

  public filterChanged(filter: string): void {
    if (this._filterTimeoutIdentifier) {
      clearTimeout(this._filterTimeoutIdentifier);
    }

    this._filterTimeoutIdentifier = setTimeout(() => {
      this._changeDetectorRef.reattach();
      this._changeDetectorRef.markForCheck();
      this._filterTimeoutIdentifier = undefined;
    }, 700);

    this._changeDetectorRef.detach();
  }

  public getObservations(filter: string): Array<ItemProxy> {
    let observationItemProxys: Array<ItemProxy> = [];
    TreeConfiguration.getWorkingTree().getRootProxy().visitTree(
      { includeOrigin: false }, (itemProxy: ItemProxy) => {
      let contextEntry: any = itemProxy.model.item.classProperties['context'];
      if (contextEntry && (contextEntry.definedInKind === 'Observation')){
        // Migration code
        if (!Array.isArray(itemProxy.item.context)) {
          itemProxy.item.context = (itemProxy.item.context ? [itemProxy.item.
            context] : []);
        }

        if (itemProxy.item.context.map((reference: any) => {
          // Migration code
          if (reference.id) {
            return reference.id;
          } else {
            return reference;
          }
        }).indexOf(this._itemProxy.item.id) !== -1) {
          observationItemProxys.push(itemProxy);
        }
      }
    }, undefined);

    return observationItemProxys.filter((observationItemProxy: ItemProxy) => {
      return (observationItemProxy.item.name.toLowerCase().indexOf(filter.
        toLowerCase()) !== -1);
    }).sort((oneObservationItemProxy: ItemProxy, anotherObservationItemProxy:
      ItemProxy) => {
      switch (this._selectedOrdering) {
        case JournalOrdering.ELDEST_FIRST_WHEN_OBSERVED:
          return (oneObservationItemProxy.item.observedOn -
            anotherObservationItemProxy.item.observedOn);
        case JournalOrdering.ELDEST_LAST_WHEN_OBSERVED:
          return (anotherObservationItemProxy.item.observedOn -
            oneObservationItemProxy.item.observedOn);
        case JournalOrdering.ELDEST_FIRST_JOURNAL_ENTRY_MADE:
          return oneObservationItemProxy.item.createdOn -
            anotherObservationItemProxy.item.createdOn;
        case JournalOrdering.ELDEST_LAST_JOURNAL_ENTRY_MADE:
          return anotherObservationItemProxy.item.createdOn -
            oneObservationItemProxy.item.createdOn;
        case JournalOrdering.OBSERVER:
          return oneObservationItemProxy.item.observedBy.localeCompare(
            anotherObservationItemProxy.item.observedBy);
        case JournalOrdering.JOURNAL_ENTRY_MAKER:
          return oneObservationItemProxy.item.createdBy.localeCompare(
            anotherObservationItemProxy.item.createdBy);
        case JournalOrdering.ISSUES_FIRST:
          return oneObservationItemProxy.kind.localeCompare(
            anotherObservationItemProxy.kind);
        case JournalOrdering.ISSUES_LAST:
          return anotherObservationItemProxy.kind.localeCompare(
            oneObservationItemProxy.kind);
      }
    });
  }

  public save(itemProxy: ItemProxy): void {
    this._itemRepository.upsertItem(itemProxy.kind, itemProxy.item).then(
      (returnedItemProxy: ItemProxy) => {
      this._changeDetectorRef.markForCheck();
    });
    this._editableSet.splice(this._editableSet.indexOf(itemProxy.item.id), 1);
  }

  public saveAndContinueEditing(itemProxy: ItemProxy): void {
    this._itemRepository.upsertItem(itemProxy.kind, itemProxy.item).then(
      (returnedItemProxy: ItemProxy) => {
      this._changeDetectorRef.markForCheck();
    });
  }

  public async discardChanges(itemProxy: ItemProxy): Promise<void> {
    if(itemProxy.dirty) {
      let response = await this._dialogService.openYesNoDialog('Discard Changes?', '');
      if(response === false) {
        return;
      }
      if (response === true) {
        this._itemRepository.fetchItem(itemProxy);
        this._editableSet.splice(this._editableSet.indexOf(itemProxy.item.id), 1);
        this._changeDetectorRef.markForCheck();
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
    }).updateSize('70%', '70%');
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
