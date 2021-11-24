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
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit,
  OnDestroy, Input, ViewChildren, QueryList, Optional, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription,  BehaviorSubject } from 'rxjs';

// Other External Dependencies

// Kohese
import { NavigationService } from '../../services/navigation/navigation.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { FormatObjectEditorComponent } from '../object-editor/format-object-editor/format-object-editor.component';
import { FormatDefinitionType } from '../../../../common/src/FormatDefinition.interface';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';

/* This component serves as a manager for viewing proxy details in the explore view.
   It functions by retrieving an id from the route parameters and then retrieving
   the proxy from the current tree configuration object
*/
@Component({
  selector: 'details-view',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsComponent implements OnInit, OnDestroy {
  private _itemProxy: ItemProxy;
  get itemProxy() {
    return this._itemProxy;
  }
  @Input('itemProxy')
  set itemProxy(itemProxy: ItemProxy) {
    this._itemProxy = itemProxy;
    this._itemRepository.getHistoryFor(this.itemProxy);

    if (this._itemProxy) {
      this._itemRepository.registerRecentProxy(this._itemProxy);
    }

    this.proxyStream.next(this._itemProxy);
  }

  startingTabIndex: number = 0;
  _startWithJournal: boolean = false;
  @Input('startWithJournal')
  set startWithJournal(value: boolean) {
    this._startWithJournal = value;
    if (this._startWithJournal) {
      this.startingTabIndex = 4;
    }
  }

  treeConfig: TreeConfiguration;

  /* Observables */
  proxyStream: BehaviorSubject<ItemProxy> = new BehaviorSubject<ItemProxy>(
    undefined);
  editableStream: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false);

  /* Subscriptions */
  treeConfigSub: Subscription;

  get matDialogRef() {
    return this._matDialogRef;
  }

  get FormatDefinitionType() {
    return FormatDefinitionType;
  }

  @ViewChildren(FormatObjectEditorComponent)
  private _formatObjectEditorQueryList: QueryList<FormatObjectEditorComponent>;

  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef: MatDialogRef<DetailsComponent>,
    private _itemRepository: ItemRepository, private _navigationService:
    NavigationService, private _dialogService: DialogService) {
  }

  public ngOnInit(): void {
    if (this.isDialogInstance()) {
      this.treeConfig = TreeConfiguration.getWorkingTree();
      this.itemProxy = this._data['itemProxy'];
      this.startWithJournal = this._data['startWithJournal'];
    } else {
      this.treeConfigSub = this._itemRepository.getTreeConfig().subscribe(
        (treeConfigurationObject: any) => {
        this.treeConfig = treeConfigurationObject.config;
        this.editableStream.next(false);
        if (this._itemProxy) {
          this.itemProxy = this.treeConfig.getProxyFor(this._itemProxy.item.
            id);
        }

        this._changeDetectorRef.markForCheck();
      });
    }
  }

  public ngOnDestroy(): void {
    if (!this.isDialogInstance()) {
      this.treeConfigSub.unsubscribe();
    }
  }

  public isDialogInstance(): boolean {
    return (this._matDialogRef && (this._matDialogRef.componentInstance ===
      this) && this._data);
  }

  public async upsertItem(): Promise<void> {
    let kind: string;
    let formatObjectEditorArray: Array<FormatObjectEditorComponent> = this.
      _formatObjectEditorQueryList.toArray();
    if (formatObjectEditorArray.length > 0) {
      kind = formatObjectEditorArray[0].selectedType.name;
    } else {
      kind = this._itemProxy.kind;
    }

    try {
      await this._itemRepository.upsertItem(kind, this._itemProxy.item);
      this.editableStream.next(false);
      this._changeDetectorRef.markForCheck();
    } catch (error) {
    }
  }

  public async upsertItemAndContinueEditing(): Promise<void> {
    let kind: string;
    let formatObjectEditorArray: Array<FormatObjectEditorComponent> = this.
      _formatObjectEditorQueryList.toArray();
    if (formatObjectEditorArray.length > 0) {
      kind = formatObjectEditorArray[0].selectedType.name;
    } else {
      kind = this._itemProxy.kind;
    }

    try {
      await this._itemRepository.upsertItem(kind, this._itemProxy.item);
      this._changeDetectorRef.markForCheck();
    } catch (error) {
    }
  }

  public cancelEditing(): void {
    this._itemRepository.fetchItem(this._itemProxy).then(() => {
      this.editableStream.next(false);
      this._changeDetectorRef.markForCheck();
    });
  }

  public navigate(id: string, openNewTab: boolean): void {
    if (openNewTab) {
      this._navigationService.addTab('Explore', { id: id });
    } else {
      this._navigationService.navigate('Explore', { id: id });
    }
  }

  public shouldDocumentTabIndicateModification(): boolean {
    let itemProxyStack: Array<ItemProxy> = [this.itemProxy];
    while (itemProxyStack.length > 0) {
      let ip: ItemProxy = itemProxyStack.pop();
      if (ip.dirty) {
        return true;
      }

      itemProxyStack.push(...ip.children);
    }

    return false;
  }
}
