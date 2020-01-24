import { MAT_DIALOG_DATA } from '@angular/material';
import { Input, Inject, ViewChild } from '@angular/core';

import { ItemRepository } from '../../../../../../services/item-repository/item-repository.service';
import { NavigationService } from '../../../../../../services/navigation/navigation.service';
import { DialogService } from '../../../../../../services/dialog/dialog.service';
import { DetailsDialogComponent } from '../../../../../details/details-dialog/details-dialog.component';
import { FormatDefinition,
  FormatDefinitionType } from '../../../../../type-editor/FormatDefinition.interface';
import { ItemProxy } from './../../../../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../../../../common/src/tree-configuration';
import { Component, OnInit } from '@angular/core';

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
  
  get TreeConfiguration() {
    return TreeConfiguration;
  }

  constructor(@Inject(MAT_DIALOG_DATA) private data: any,
    private _itemRepository: ItemRepository, private _navigationService:
    NavigationService, private _dialogService: DialogService) {
    if (this.data) {
      this._proxies = data.proxies;
      this._kindName = data.kindName;
      this._stateName = data.stateName;
      this.color = TreeConfiguration.getWorkingTree().getProxyFor(
        'view-' + this._kindName.toLowerCase()).item.color;
    }
  }

  ngOnInit() {

  }

  toggleExpandRow(row) {
    console.log('Toggled Expand Row!', row);
    this.table.rowDetail.toggleExpandRow(row);
  }

  public getViewModel(itemProxy: ItemProxy): any {
    return TreeConfiguration.getWorkingTree().getProxyFor('view-' + itemProxy.
      kind.toLowerCase()).item;
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
    this._dialogService.openComponentDialog(DetailsDialogComponent, {
      data: {
        itemProxy: itemProxy
      }
    }).updateSize('70%', '70%');
  }
  
  public navigate(itemProxy: ItemProxy): void {
    this._navigationService.addTab('Explore', { id: itemProxy.item.id });
  }
  
  public getAttributes(type: any): Array<any> {
    let attributes: Array<any> = [];
    for (let attributeName in type.classProperties) {
      let attribute: any = type.classProperties[attributeName].definition;
      attribute.name = attributeName;
      attributes.push(attribute);
    }
    
    return attributes;
  }
  
  public getFormatDefinition(itemProxy: ItemProxy): FormatDefinition {
    let viewModel: any = this.getViewModel(itemProxy);
    let formatDefinition: FormatDefinition = viewModel.formatDefinitions[
      viewModel.defaultFormatKey[FormatDefinitionType.CARD]];
    if (formatDefinition) {
      return formatDefinition;
    }
    
    return viewModel.formatDefinitions[FormatDefinitionType.DOCUMENT];
  }
}
