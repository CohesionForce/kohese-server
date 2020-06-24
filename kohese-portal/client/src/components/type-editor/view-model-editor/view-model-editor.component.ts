import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input,
  ViewChild, Output, EventEmitter } from '@angular/core';
import * as Uuid from 'uuid/v1';
import { MatTable } from '@angular/material';

import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { FormatPreviewComponent } from '../format-editor/format-preview/format-preview.component';
import { TableDefinition } from '../../../../../common/src/TableDefinition.interface';
import { FormatDefinition,
  FormatDefinitionType } from '../../../../../common/src/FormatDefinition.interface';
import { FormatContainer,
  FormatContainerKind } from '../../../../../common/src/FormatContainer.interface';
import { PropertyDefinition } from '../../../../../common/src/PropertyDefinition.interface';
import { InputDialogKind } from '../../dialog/input-dialog/input-dialog.component';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { TypeKind } from '../../../../../common/src/Type.interface';
import { EnumerationValue } from '../../../../../common/src/Enumeration.interface';

interface Icon {
  name: string,
  iconString: string,
  usages: Array<string>
}

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
    this._isLocalType = true;
    TreeConfiguration.getWorkingTree().getRootProxy().visitTree(
      { includeOrigin: false }, (itemProxy: ItemProxy) => {
      if ((itemProxy.kind === 'KoheseView') && (itemProxy.item === this.
        _viewModel)) {
        this._isLocalType = false;
      }
    }, undefined);
    
    this._editable = this._hasUnsavedChanges;
    
    let viewModels: Array<any> = [];
    TreeConfiguration.getWorkingTree().getRootProxy().visitTree(
      { includeOrigin: false }, (itemProxy: ItemProxy) => {
      if (itemProxy.kind === 'KoheseView') {
        viewModels.push(itemProxy.item);
      }
    }, undefined);
    
    this._itemRepository.getIcons().then((iconNames: Array<string>) => {
      this._icons = iconNames.sort().map(
        (iconName: string) => {
        let iconString: string = 'fa fa-' + iconName;
        return {
          name: this.getIconName(iconName),
          iconString: iconString,
          usages: viewModels.filter((viewModel: any) => {
            return (viewModel.icon === iconString);
          }).map((viewModel: any) => {
            return viewModel.modelName;
          })
        };
      });
    });
    
    this._attributes = [];
    for (let attributeName in this._viewModel.viewProperties) {
      let attribute: any = this._viewModel.viewProperties[attributeName];
      // Migration code
      attribute.name = attributeName;
      this._attributes.push(attribute);
    }
  }
  
  private _hasUnsavedChanges: boolean = false;
  get hasUnsavedChanges() {
    return this._hasUnsavedChanges;
  }
  @Input('hasUnsavedChanges')
  set hasUnsavedChanges(hasUnsavedChanges: boolean) {
    this._hasUnsavedChanges = hasUnsavedChanges;
    this.viewModel = this._viewModel;
  }
  
  private _modifiedEventEmitter: EventEmitter<void> = new EventEmitter<void>();
  @Output('modified')
  get modifiedEventEmitter() {
    return this._modifiedEventEmitter;
  }
   
  private _dataModel: any;
  get dataModel() {
    return this._dataModel;
  }
  @Input('dataModel')
  set dataModel(dataModel: any) {
    this._dataModel = dataModel;
  }
  
  private _editable: boolean = false;
  get editable() {
    return this._editable;
  }
  set editable(editable: boolean) {
    this._editable = editable;
  }
  
  private _isLocalType: boolean = false;
  get isLocalType() {
    return this._isLocalType;
  }
  
  private _icons: Array<Icon>;
  private _filter: string;
  private _iconFilterTimeoutIdentifier: any;
  
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
      'Number': 'number'
    },
    'string': {
      'Text': 'text',
      'Markdown': 'markdown',
      'Masked String': 'maskedString'
    },
    'StateMachine': {
      'State': 'state-editor'
    },
    'timestamp': {
      'Date': 'date'
    },
    'user-selector': {
      'Username': 'user-selector'
    }
  };
  
  get FormatDefinitionType() {
    return FormatDefinitionType;
  }
  
  get TypeKind() {
    return TypeKind;
  }
  
  get Object() {
    return Object;
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
  
  public getIconName(iconName: string): string {
    let name: string =  iconName.replace(/-(\S{1})/g, (match: string,
      captureGroup: string, offset: number, source: string) => {
      return ' ' + captureGroup.toUpperCase();
    });
    
    return name.charAt(0).toUpperCase() + name.substring(1);
  }
  
  public filterChanged(filter: string): void {
    if (this._iconFilterTimeoutIdentifier) {
      clearTimeout(this._iconFilterTimeoutIdentifier);
    }
    
    this._iconFilterTimeoutIdentifier = setTimeout(() => {
      this._filter = filter;      
      this._changeDetectorRef.markForCheck();
      this._iconFilterTimeoutIdentifier = undefined;
    }, 700);
  }
  
  public getIcons(): Array<Icon> {
    if (this._filter) {
      return this._icons.filter((icon: Icon) => {
        return icon.name.toLowerCase().includes(this._filter.toLowerCase());
      });
    }
    
    return this._icons;
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
  
  public colorSelected(color: string): void {
    let conflictingKindNames: Array<string> = [];
    TreeConfiguration.getWorkingTree().getRootProxy().visitTree(
      { includeOrigin: false }, (itemProxy: ItemProxy) => {
      if ((itemProxy.kind === 'KoheseView') && (itemProxy.item !== this.
        _viewModel) && (itemProxy.item.color === color)) {
        conflictingKindNames.push(itemProxy.item.modelName);
      }
    }, undefined);
    
    if (conflictingKindNames.length > 0) {
      this._dialogService.openInformationDialog('Color In Use', 'This ' +
        'color is already used for the following kinds:\n\t\t- ' +
        conflictingKindNames.join('\n\t\t- '));
    }
    
    this._viewModel.color = color;
    this._changeDetectorRef.markForCheck();
  }
  
  public async addTableDefinition(): Promise<void> {
    let name: any = await this._dialogService.openInputDialog('Add Table ' +
      'Definition', '', InputDialogKind.STRING, 'Name', '', (input: any) => {
      return !!input;
    });
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
      
      this._modifiedEventEmitter.emit();
      this._changeDetectorRef.markForCheck();
    }
  }
  
  public async renameTableDefinition(tableDefinitionId: string):
    Promise<void> {
    let tableDefinition: TableDefinition = this._viewModel.tableDefinitions[
      tableDefinitionId];
    let name: any = await this._dialogService.openInputDialog('Rename ' +
      tableDefinition.name, '', InputDialogKind.STRING, 'Name', tableDefinition.
      name, (input: any) => {
      return !!input;
    });
    if (name) {
      tableDefinition.name = name;
      this._modifiedEventEmitter.emit();
      this._changeDetectorRef.markForCheck();
    }
  }
  
  public removeTableDefinition(tableDefinitionId: string): void {
    delete this._viewModel.tableDefinitions[tableDefinitionId];
    this._modifiedEventEmitter.emit();
    this._changeDetectorRef.markForCheck();
  }
  
  public async addFormatDefinition(): Promise<void> {
    let name: any = await this._dialogService.openInputDialog('Add Format ' +
      'Definition', '', InputDialogKind.STRING, 'Name', '', (input: any) => {
      return !!input;
    });
    if (name) {
      let id: string = (<any> Uuid).default();
      let formatDefinition: FormatDefinition = {
        id: id,
        name: name,
        header: {
          kind: FormatContainerKind.HEADER,
          contents: []
        },
        containers: []
      };
      
      let propertyDefinition: PropertyDefinition = {
        propertyName: '',
        customLabel: '',
        labelOrientation: 'Top',
        kind: '',
        visible: true,
        editable: true
      };
      
      let attribute: any;
      if (this._isLocalType) {
        attribute = this._dataModel.properties[Object.keys(this._dataModel.
          properties)[0]];
      } else {
        attribute = this._dataModel.classProperties['name'].definition;
      }
      
      propertyDefinition.propertyName = attribute.name;
      propertyDefinition.customLabel = attribute.name;
      
      let attributeType: string = (Array.isArray(attribute.type) ? attribute.
        type[0] : attribute.type); 
      switch (attributeType) {
        case 'boolean':
          propertyDefinition.kind = 'boolean';
          break;
        case 'number':
          propertyDefinition.kind = 'number';
          break;
        case 'string':
          propertyDefinition.kind = 'text';
          break;
        case 'StateMachine':
          propertyDefinition.kind = 'state-editor';
          break;
        case 'timestamp':
          propertyDefinition.kind = 'date';
          break;
        case 'user-selector':
          propertyDefinition.kind = 'user-selector';
          break;
      }
      
      if (this._isLocalType) {
        formatDefinition.containers.push({
          kind: FormatContainerKind.VERTICAL,
          contents: [propertyDefinition]
        });
      } else {
        formatDefinition.header.contents.push(propertyDefinition);
      }
      
      this._viewModel.formatDefinitions[id] = formatDefinition;
      
      this._modifiedEventEmitter.emit();
      this._changeDetectorRef.markForCheck();
    }
  }
  
  public async renameFormatDefinition(formatDefinitionId: string):
    Promise<void> {
    let formatDefinition: FormatDefinition = this._viewModel.formatDefinitions[
      formatDefinitionId];
    let name: any = await this._dialogService.openInputDialog('Rename ' +
      formatDefinition.name, '', InputDialogKind.STRING, 'Name', formatDefinition.
      name, (input: any) => {
      return !!input;
    });
    if (name) {
      formatDefinition.name = name;
      this._modifiedEventEmitter.emit();
      this._changeDetectorRef.markForCheck();
    }
  }
  
  public previewFormatDefinition(formatDefinitionId: string): void {
    this._dialogService.openComponentDialog(FormatPreviewComponent, {
      data: {
        format: this._viewModel.formatDefinitions[formatDefinitionId],
        type: this._dataModel
      }
    }).updateSize('70%', '70%');
  }
  
  public setDefaultFormatDefinition(formatDefinitionType: FormatDefinitionType,
    formatDefinitionId: string): void {
    if ((formatDefinitionType !== FormatDefinitionType.DOCUMENT) &&
      (formatDefinitionId === this._viewModel.defaultFormatKey[
      formatDefinitionType])) {
      delete this._viewModel.defaultFormatKey[formatDefinitionType];
    } else {
      this._viewModel.defaultFormatKey[formatDefinitionType] =
        formatDefinitionId;
    }
    
    this._modifiedEventEmitter.emit();
    this._changeDetectorRef.markForCheck();
  }
  
  public mayRemoveFormatDefinition(formatDefinitionId: string): boolean {
    if (this._isLocalType) {
      TreeConfiguration.getWorkingTree().getRootProxy().visitTree(
        { includeOrigin: false }, (itemProxy: ItemProxy) => {
        if (itemProxy.kind === 'KoheseView') {
          for (let id in itemProxy.item.formatDefinitions) {
            let formatDefinition: FormatDefinition = itemProxy.item.
              formatDefinitions[id];
            if (formatDefinition.header.contents[0].formatDefinition ===
              formatDefinitionId) {
              return false;
            }
            
            for (let j: number = 0; j < formatDefinition.containers.length;
              j++) {
              let formatContainer: FormatContainer = formatDefinition.
                containers[j];
              for (let k: number = 0; k < formatContainer.contents.length;
                k++) {
                if (formatContainer.contents[k].formatDefinition ===
                  formatDefinitionId) {
                  return false;
                }
              }
            }
          }
        }
      }, undefined);
    }
    
    return (this._viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT] !==
      formatDefinitionId);
  }
  
  public removeFormatDefinition(formatDefinitionId: string): void {
    if (this._viewModel.defaultFormatKey === formatDefinitionId) {
      this._viewModel.defaultFormatKey = Object.keys(this._viewModel.
        formatDefinitions)[0];
    }
    
    delete this._viewModel.formatDefinitions[formatDefinitionId];
    
    this._modifiedEventEmitter.emit();
    this._changeDetectorRef.markForCheck();
  }
  
  public getAttributes(): Array<any> {
    if (this._isLocalType) {
      return Object.values(this._dataModel.properties);
    } else {
      let attributes: Array<any> = [];
      for (let attributeName in this._dataModel.classProperties) {
        let attribute: any = this._dataModel.classProperties[attributeName].
          definition;
        attribute.name = attributeName;
        attributes.push(attribute);
      }
      
      return attributes;
    }
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

  public getEnumerationValueIdentifier(index: number, enumerationValue:
    EnumerationValue): string {
    return index.toString();
  }
}
