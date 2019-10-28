import { Component, ChangeDetectionStrategy, ChangeDetectorRef,
  Input } from '@angular/core';
import * as Uuid from 'uuid/v1';
import { MatTable } from '@angular/material';

import { DialogService,
  DialogComponent } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { IconSelectorComponent } from '../icon-selector/icon-selector.component';
import { FormatPreviewComponent } from '../format-editor/format-preview/format-preview.component';
import { TableDefinition } from '../TableDefinition.interface';
import { FormatDefinition } from '../FormatDefinition.interface';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';

@Component({
  selector: 'view-model-editor',
  templateUrl: './view-model-editor.component.html',
  styleUrls: ['./view-model-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewModelEditorComponent {
  private _viewModel: any;
  get viewModel() {
    return this._viewModel;
  }
  @Input('viewModel')
  set viewModel(viewModel: any) {
    this._viewModel = viewModel;
    
    this._itemProxy = TreeConfiguration.getWorkingTree().getProxyFor(this.
      _viewModel.id);
    this._editable = this._itemProxy.dirty;
    this._attributes = [];
    for (let attributeName in this._viewModel.viewProperties) {
      let attribute: any = this._viewModel.viewProperties[attributeName];
      // Migration code
      attribute.name = attributeName;
      this._attributes.push(attribute);
    }
  }
  
  private _itemProxy: ItemProxy;
  get itemProxy() {
    return this._itemProxy;
  }
  
  private _editable: boolean = false;
  get editable() {
    return this._editable;
  }
  set editable(editable: boolean) {
    this._editable = editable;
  }
  
  private _attributes: Array<any>;
  get attributes() {
    return this._attributes;
  }
  
  get Object() {
    return Object;
  }
  
  get TreeConfiguration() {
    return TreeConfiguration;
  }
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    private _dialogService: DialogService, private _itemRepository:
    ItemRepository) {
  }
  
  public save(): void {
    this._itemRepository.upsertItem('KoheseView', this._viewModel);
    this._editable = false;
  }
  
  public discardChanges(): void {
    this._itemRepository.fetchItem(TreeConfiguration.getWorkingTree().
      getProxyFor(this._viewModel.id));
    this._editable = false;
    this._changeDetectorRef.markForCheck();
  }
  
  public openIconSelectionDialog(): void {
    this._dialogService.openComponentDialog(IconSelectorComponent, {
      data: {}
    }).afterClosed().subscribe((result: string) => {
      if ('\0' !== result) {
        this._viewModel.icon = result;
        this._itemProxy.dirty = true;
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public addTableDefinition(): void {
    this._dialogService.openInputDialog('Add Table Definition', '',
      DialogComponent.INPUT_TYPES.TEXT, 'Name', '', (input: any) => {
      return !!input;
    }).afterClosed().subscribe((name: any) => {
      if (name) {
        let id: string = (<any> Uuid).default();
        this._viewModel.tableDefinitions[id] = {
          id: id,
          name: name,
          columns: [],
          expandedFormat: {
            column1: [],
            column2: [],
            column3: [],
            column4: []
          }
        };
        
        this._itemProxy.dirty = true;
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public renameTableDefinition(tableDefinitionId: string): void {
    let tableDefinition: TableDefinition = this._viewModel.tableDefinitions[
      tableDefinitionId];
    this._dialogService.openInputDialog('Rename ' + tableDefinition.name, '',
      DialogComponent.INPUT_TYPES.TEXT, 'Name', tableDefinition.name, (input:
      any) => {
      return !!input;
    }).afterClosed().subscribe((name: any) => {
      if (name) {
        tableDefinition.name = name;
        this._itemProxy.dirty = true;
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public removeTableDefinition(tableDefinitionId: string): void {
    delete this._viewModel.tableDefinitions[tableDefinitionId];
    this._itemProxy.dirty = true;
    this._changeDetectorRef.markForCheck();
  }
  
  public addFormatDefinition(): void {
    this._dialogService.openInputDialog('Add Format Definition', '',
      DialogComponent.INPUT_TYPES.TEXT, 'Name', '', (input: any) => {
      return !!input;
    }).afterClosed().subscribe((name: any) => {
      if (name) {
        let id: string = (<any> Uuid).default();
        this._viewModel.formatDefinitions[id] = {
          id: id,
          name: name,
          header: {
            kind: 'header',
            contents: [{
              propertyName: {
                kind: 'Item',
                attribute: 'name'
              },
              hideLabel: true,
              hideEmpty: false,
              labelOrientation: 'Top',
              kind: 'text',
              inputOptions: {}
            }]
          },
          containers: []
        };
        
        this._itemProxy.dirty = true;
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public renameFormatDefinition(formatDefinitionId: string): void {
    let formatDefinition: FormatDefinition = this._viewModel.formatDefinitions[
      formatDefinitionId];
    this._dialogService.openInputDialog('Rename ' + formatDefinition.name, '',
      DialogComponent.INPUT_TYPES.TEXT, 'Name', formatDefinition.name, (input:
      any) => {
      return !!input;
    }).afterClosed().subscribe((name: any) => {
      if (name) {
        formatDefinition.name = name;
        this._itemProxy.dirty = true;
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public previewFormatDefinition(formatDefinitionId: string): void {
    this._dialogService.openComponentDialog(FormatPreviewComponent, {
      data: {
        format: this._viewModel.formatDefinitions[formatDefinitionId],
        type: TreeConfiguration.getWorkingTree().getProxyFor(this._viewModel.
          modelName).item
      }
    }).updateSize('70%', '70%');
  }
  
  public setDefaultFormatDefinition(formatDefinitionId: string): void {
    this._viewModel.defaultFormatKey = formatDefinitionId;
    this._itemProxy.dirty = true;
    this._changeDetectorRef.markForCheck();
  }
  
  public removeFormatDefinition(formatDefinitionId: string): void {
    if (this._viewModel.defaultFormatKey === formatDefinitionId) {
      this._viewModel.defaultFormatKey = Object.keys(this._viewModel.
        formatDefinitions)[0];
    }
    
    delete this._viewModel.formatDefinitions[formatDefinitionId];
    
    this._itemProxy.dirty = true;
    this._changeDetectorRef.markForCheck();
  }
  
  public sortAttributes(table: MatTable<any>, columnId: string, sortDirection:
    string): void {
    if (sortDirection) {
      let attributeName: string;
        switch (columnId) {
          case 'Name':
            attributeName = 'name';
            break;
          case 'Display Name':
            attributeName = 'displayName';
            break;
        }
        
        this._attributes.sort((oneElement: any, anotherElement: any) => {
          if (sortDirection === 'asc') {
            return String(oneElement[attributeName]).localeCompare(
              String(anotherElement[attributeName]));
          } else {
            return String(anotherElement[attributeName]).localeCompare(
              String(oneElement[attributeName]));
          }
        });
    } else {
      let unsortedData: Array<any> = [];
      for (let attributeName in this._viewModel.viewProperties) {
        let attribute: any = this._viewModel.viewProperties[attributeName];
        // Migration code
        attribute.name = attributeName;
        unsortedData.push(attribute);
      }
      
      this._attributes.sort((oneElement: any, anotherElement: any) => {
        return (unsortedData.indexOf(oneElement) - unsortedData.indexOf(
          anotherElement));
      });
    }
    
    table.renderRows();
    this._changeDetectorRef.markForCheck();
  }
}
