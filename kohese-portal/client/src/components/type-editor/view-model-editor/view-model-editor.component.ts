import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input,
  ViewChild, OnInit } from '@angular/core';
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
export class ViewModelEditorComponent implements OnInit {
  private _viewModel: any;
  get viewModel() {
    return this._viewModel;
  }
  @Input('viewModel')
  set viewModel(viewModel: any) {
    this._viewModel = viewModel;
    this._dataModel = TreeConfiguration.getWorkingTree().getProxyFor(this.
      _viewModel.modelName).item;
    
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
  
  private _icons: Array<string>;
  get icons() {
    return this._icons;
  }
  
  @ViewChild('attributeTable')
  private _attributeTable: MatTable<any>;
  
  private _attributes: Array<any>;
  get attributes() {
    return this._attributes;
  }
  
  private _types: any = {
    'boolean': {
      'Boolean': 'boolean'
    },
    'number': {
      'Number': 'number',
      'Date': 'date'
    },
    'string': {
      'Text': 'text',
      'Markdown': 'markdown'
    },
    'StateMachine': {
      'State': 'state-editor'
    },
    'user-selector': {
      'Username': 'user-selector'
    }
  };
  
  private _dataModel: any;
  get dataModel() {
    return this._dataModel;
  }
  
  get Object() {
    return Object;
  }
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    private _dialogService: DialogService, private _itemRepository:
    ItemRepository) {
  }
  
  public async ngOnInit(): Promise<void> {
    this._icons = await this._itemRepository.getIcons();
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
  
  public iconSelected(icon: string): void {
    let conflictingKindNames: Array<string> = [];
    TreeConfiguration.getWorkingTree().getRootProxy().visitTree(
      { includeOrigin: false }, (itemProxy: ItemProxy) => {
      if ((itemProxy.kind === 'KoheseView') && (itemProxy.item !== this.
        _viewModel) && (itemProxy.item.icon === icon)) {
        conflictingKindNames.push(itemProxy.item.modelName);
      }
    }, undefined);
    
    if (conflictingKindNames.length > 0) {
      this._dialogService.openInformationDialog('Icon In Use', 'This icon ' +
        'is already used for the following kinds:\n\t\t- ' +
        conflictingKindNames.join('\n\t\t- '));
    }
    
    this._viewModel.icon = icon;
    this._changeDetectorRef.markForCheck();
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
        type: this._dataModel
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
  
  public sortAttributes(columnId: string, sortDirection: string): void {
    if (sortDirection) {
      if (columnId === 'Display Type') {
        this._attributes.sort((oneElement: any, anotherElement: any) => {
          if (sortDirection === 'asc') {
            return oneElement.inputType.type.localeCompare(anotherElement.
              inputType.type);
          } else {
            return anotherElement.inputType.type.localeCompare(oneElement.
              inputType.type);
          }
        });
      } else {
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
      }
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
    
    this._attributeTable.renderRows();
    this._changeDetectorRef.markForCheck();
  }
  
  public getTypes(attributeName: string): Array<string> {
    let dataModelType: string = (Array.isArray(this._dataModel.properties[
      attributeName].type) ? this._dataModel.properties[attributeName].type[
      0] : this._dataModel.properties[attributeName].type);
    if ((dataModelType === 'string') && this._dataModel.properties[
      attributeName].relation) {
      return Object.keys(this._types['user-selector']);
    } else if (this._types[dataModelType]) {
      return Object.keys(this._types[dataModelType]);
    } else {
      return ['Reference'];
    }
  }
  
  public getTypeValue(attributeName: string, type: string): string {
    if (type === 'Reference') {
      return '';
    } else {
      if ((type === Object.keys(this._types['user-selector'])[0]) && this.
        _dataModel.properties[attributeName].relation) {
        return 'user-selector';
      } else {
        return this._types[(Array.isArray(this._dataModel.properties[
          attributeName].type) ? this._dataModel.properties[attributeName].
          type[0] : this._dataModel.properties[attributeName].type)][type];
      }
    }
  }
  
  public areTypeValuesEqual(option: string, selection: string): boolean {
    if ((option === '') && (selection === 'proxy-selector')) {
      return true;
    } else if ((option === 'state-editor') && (selection === 'StateMachine')) {
      return true;
    } else {
      return (option === selection);
    }
  }
}
