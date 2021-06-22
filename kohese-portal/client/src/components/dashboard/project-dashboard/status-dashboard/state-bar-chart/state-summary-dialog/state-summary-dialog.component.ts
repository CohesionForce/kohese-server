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


import { MAT_DIALOG_DATA } from '@angular/material';
import { Input, Inject, ViewChild, ViewChildren, QueryList } from '@angular/core';

import { ItemRepository } from '../../../../../../services/item-repository/item-repository.service';
import { NavigationService } from '../../../../../../services/navigation/navigation.service';
import { DialogService } from '../../../../../../services/dialog/dialog.service';
import { DetailsComponent } from '../../../../../details/details.component';
import { FormatDefinition, FormatDefinitionType } from '../../../../../../../../common/src/FormatDefinition.interface';
import { ItemProxy } from './../../../../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../../../../common/src/tree-configuration';
import { Component, OnInit } from '@angular/core';
import { MatExpansionPanel, MatAccordion, MatExpansionPanelActionRow, MatExpansionModule } from '@angular/material'


@Component({
  selector: 'state-summary-dialog',
  templateUrl: './state-summary-dialog.component.html',
  styleUrls: ['./state-summary-dialog.component.scss']
})
export class StateSummaryDialogComponent implements OnInit {
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

  constructor(@Inject(MAT_DIALOG_DATA) private data: any,
    private _itemRepository: ItemRepository, private _navigationService:
    NavigationService, private _dialogService: DialogService) {
    if (this.data) {
      this._proxies = data.proxies;
      this._kindName = data.kindName;
      this._stateName = data.stateName;
      this.color = TreeConfiguration.getWorkingTree().getModelProxyFor(this._kindName).view.item.color;
    }
  }

  ngOnInit() { }

  toggleExpandRow(row) {
    console.log('Toggled Expand Row!', row);
    this.table.rowDetail.toggleExpandRow(row);
  }

  public getViewModel(itemProxy: ItemProxy): any {
    return itemProxy.model.view.item;
  }

  public save(itemProxy: ItemProxy): void {
    this._itemRepository.upsertItem(itemProxy.kind, itemProxy.item);
    this._editableSet.splice(this._editableSet.indexOf(itemProxy.item.id), 1);
  }

  public discardChanges(itemProxy: ItemProxy): void {
    this._itemRepository.fetchItem(TreeConfiguration.getWorkingTree().
      getProxyFor(itemProxy.item.id));
    this._editableSet.splice(this._editableSet.indexOf(itemProxy.item.id), 1);
  }

  public displayInformation(itemProxy: ItemProxy): void {
    this._dialogService.openComponentDialog(DetailsComponent, {
      data: {
        itemProxy: itemProxy
      }
    }).updateSize('70%', '70%');
  }

  public getHeader(itemProxy: ItemProxy): string {
    let viewModel: any = this.getViewModel(itemProxy);
    let formatDefinitionId: string = viewModel.defaultFormatKey[FormatDefinitionType.CARD];
    if(formatDefinitionId == null) {
      formatDefinitionId = viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT];
    }
    return viewModel.formatDefinitions[formatDefinitionId].header.contents[0].propertyName;
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
