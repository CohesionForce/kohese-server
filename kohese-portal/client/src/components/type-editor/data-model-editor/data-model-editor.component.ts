import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input,
  ViewChild, Output, EventEmitter } from '@angular/core';
import { MatTable } from '@angular/material';
import * as Uuid from 'uuid/v1';

import { DialogService } from '../../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { AttributeEditorComponent } from '../attribute-editor/attribute-editor.component';
import { FormatDefinition,
  FormatDefinitionType } from '../FormatDefinition.interface';
import { FormatContainer,
  FormatContainerKind } from '../FormatContainer.interface';
import { PropertyDefinition } from '../PropertyDefinition.interface';
import { StateMachineEditorComponent } from '../../state-machine-editor/state-machine-editor.component';
import { InputDialogKind,
  InputDialogComponent } from '../../dialog/input-dialog/input-dialog.component';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';

@Component({
  selector: 'data-model-editor',
  templateUrl: './data-model-editor.component.html',
  styleUrls: ['./data-model-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataModelEditorComponent {
  private _dataModel: any;
  get dataModel() {
    return this._dataModel;
  }
  @Input('dataModel')
  set dataModel(dataModel: any) {
    this._dataModel = dataModel;
    this._filteredKinds = [];
    this._attributeTypes = JSON.parse(JSON.stringify(this._fundamentalTypes));
    this._idAttributes = {};
    
    if (!this._enclosingType) {
      for (let localTypeName in this._dataModel.localTypes) {
        this._attributeTypes[localTypeName] = localTypeName;
      }
    }
    
    TreeConfiguration.getWorkingTree().getRootProxy().visitTree(
      { includeOrigin: false }, (itemProxy: ItemProxy) => {
      if (itemProxy.kind === 'KoheseModel') {
        let item: any = itemProxy.item;
        if (item.name !== this._dataModel.name) {
          this._filteredKinds.push(item);
        }
        
        this._attributeTypes[item.name] = item.name;
        
        for (let attributeName in item.properties) {
          let attribute: any = item.properties[attributeName];
          if (attribute.id) {
            if (!this._idAttributes[item.name]) {
              this._idAttributes[item.name] = [];
            }
  
            this._idAttributes[item.name].push(attributeName);
          }
        }
      }
    }, undefined);
    this._filteredKinds.sort((oneKind: any, anotherKind: any) => {
      return oneKind.name.localeCompare(anotherKind.name);
    });
    
    this._editable = this._hasUnsavedChanges;
    this._attributes = [];
    for (let attributeName in this._dataModel.properties) {
      let attribute: any = this._dataModel.properties[attributeName];
      // Migration code
      attribute.name = attributeName;
      this._attributes.push(attribute);
    }
  }
  
  private _filteredKinds: Array<any>;
  get filteredKinds() {
    return this._filteredKinds;
  }
  
  private _fundamentalTypes: any = {
    'Boolean': 'boolean',
    'Number': 'number',
    'Text': 'string',
    'State': 'StateMachine',
    'Timestamp': 'timestamp',
    'Username': 'user-selector'
  };
  get fundamentalTypes() {
    return this._fundamentalTypes;
  }
  
  private _attributeTypes: any;
  get attributeTypes() {
    return this._attributeTypes;
  }
  
  private _idAttributes: any;
  get idAttributes() {
    return this._idAttributes;
  }
  
  private _hasUnsavedChanges: boolean = false;
  get hasUnsavedChanges() {
    return this._hasUnsavedChanges;
  }
  @Input('hasUnsavedChanges')
  set hasUnsavedChanges(hasUnsavedChanges: boolean) {
    this._hasUnsavedChanges = hasUnsavedChanges;
    this.dataModel = this._dataModel;
  }
  
  private _modifiedEventEmitter: EventEmitter<void> = new EventEmitter<void>();
  @Output('modified')
  get modifiedEventEmitter() {
    return this._modifiedEventEmitter;
  }
  
  private _editable: boolean = false;
  get editable() {
    return this._editable;
  }
  set editable(editable: boolean) {
    this._editable = editable;
  }
  
  private _enclosingType: any;
  get enclosingType() {
    return this._enclosingType;
  }
  @Input('enclosingType')
  set enclosingType(enclosingType: any) {
    this._enclosingType = enclosingType;
    this.dataModel = this._dataModel;
  }
  
  @ViewChild('attributeTable')
  private _attributeTable: MatTable<any>;
  
  private _attributes: Array<any>;
  get attributes() {
    return this._attributes;
  }
  
  get Array() {
    return Array;
  }
  
  get Object() {
    return Object;
  }
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    private _dialogService: DialogService, private _dynamicTypesService:
    DynamicTypesService, private _itemRepository: ItemRepository) {
  }
  
  public save(): void {
    let dataModel: any = (this._enclosingType ? this._enclosingType : this.
      _dataModel);
    
    this._itemRepository.upsertItem('KoheseModel', dataModel).then(
      (itemProxy: ItemProxy) => {
      this._changeDetectorRef.markForCheck();
    });
    this._editable = false;
  }
  
  public discardChanges(): void {
    this._itemRepository.fetchItem(TreeConfiguration.getWorkingTree().
      getProxyFor(this._dataModel.id));
    this._editable = false;
    this._changeDetectorRef.markForCheck();
  }
  
  public async parentTypeSelected(parentType: any): Promise<void> {
    let viewModelProxy: ItemProxy;
    if (this._enclosingType) {
      viewModelProxy = TreeConfiguration.getWorkingTree().getProxyFor('view-' +
        this._enclosingType.name.toLowerCase());
    } else {
      viewModelProxy = TreeConfiguration.getWorkingTree().getProxyFor('view-' +
        this._dataModel.name.toLowerCase());
    }
    
    if (this._hasUnsavedChanges || viewModelProxy.dirty) {
      let response: any = await this._dialogService.openYesNoDialog(
        'Display Modifications', 'All unsaved modifications to this kind ' +
        'are to be saved if an attribute is added to this kind. Do you want ' +
        'to proceed?');
      if (!response) {
        return;
      }
    }
    
    let defaultFormatDefinition: FormatDefinition = viewModelProxy.item.
      formatDefinitions[viewModelProxy.item.defaultFormatKey[
      FormatDefinitionType.DEFAULT]];  
    defaultFormatDefinition.containers[0].contents.length = 0;
    
    let parentTypeViewModel: any = TreeConfiguration.getWorkingTree().
      getProxyFor('view-' + parentType.name.toLowerCase()).item;
    let parentTypeDefaultFormatDefinition: FormatDefinition =
      parentTypeViewModel.formatDefinitions[parentTypeViewModel.
      defaultFormatKey[FormatDefinitionType.DEFAULT]];
    for (let j: number = 0; j < parentTypeDefaultFormatDefinition.containers[
      0].contents.length; j++) {
      defaultFormatDefinition.containers[0].contents.push(JSON.parse(JSON.
        stringify(parentTypeDefaultFormatDefinition.containers[0].contents[
        j])));
    }
    
    for (let attributeName in this._dataModel.properties) {
      let propertyDefinition: PropertyDefinition = {
        propertyName: attributeName,
        customLabel: attributeName,
        labelOrientation: 'Top',
        kind: '',
        visible: true,
        editable: true
      };
      let attributeType: any = this._dataModel.properties[attributeName].type;
      attributeType = (Array.isArray(attributeType) ? attributeType[0] :
        attributeType); 
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
      
      defaultFormatDefinition.containers[0].contents.push(propertyDefinition);
    }
    
    this._dataModel.base = parentType.name;
    this._dataModel.parentId = parentType.name;
    this._modifiedEventEmitter.emit();
    
    this.save();
    this._itemRepository.upsertItem('KoheseView', viewModelProxy.item);
    
    // Re-enter edit mode
    this._editable = true;
    
    this._changeDetectorRef.markForCheck();
  }
  
  public areParentTypeValuesEqual(option: any, selection: string): boolean {
    return (option.name === selection);
  }
  
  public async addLocalType(): Promise<void> {
    let viewModelProxy: ItemProxy = TreeConfiguration.getWorkingTree().
      getProxyFor('view-' + this._dataModel.name.toLowerCase());
    if (this._hasUnsavedChanges || viewModelProxy.dirty) {
      let response: any = await this._dialogService.openYesNoDialog(
        'Display Modifications', 'All unsaved modifications to this kind ' +
        'are to be saved if a local type is added to this kind. Do you want ' +
        'to proceed?');
      if (!response) {
        return;
      }
    }
    
    this._dialogService.openComponentsDialog([{
      component: InputDialogComponent,
      matDialogData: {
        inputDialogConfiguration: {
          title: 'Local Type',
          text: '',
          fieldName: 'Name',
          value: 'Local Type',
          validate: (input: any) => {
            return !!input;
          },
          inputDialogKind: InputDialogKind.STRING
        }
      },
      label: 'Name'
    }, {
      component: AttributeEditorComponent,
      matDialogData: {},
      label: 'Attribute'
    }], { data: {} }).updateSize('90%', '90%').afterClosed().subscribe(
      (results: Array<any>) => {
      if (results) {
        let dataModel: any = {
          name: results[0],
          base: null,
          idInjection: true,
          properties: {},
          validations: [],
          relations: {},
          acls: [],
          methods: []
        };
        dataModel.properties[results[1].attribute.name] = results[1].attribute;
        
        let viewModel: any = {
          name: results[0],
          modelName: results[0],
          icon: '',
          color: '#000000',
          viewProperties: {},
          formatDefinitions: {},
          defaultFormatKey: {},
          tableDefinitions: {}
        };
        viewModel.viewProperties[results[1].attribute.name] = results[1].view;
        
        let formatDefinitionId: string = (<any> Uuid).default();
        let defaultFormatDefinition: FormatDefinition = {
          id: formatDefinitionId,
          name: 'Default Format Definition',
          header: {
            kind: FormatContainerKind.HEADER,
            contents: []
          },
          containers: [{
            kind: FormatContainerKind.VERTICAL,
            contents: []
          }]
        };
        
        let propertyDefinition: PropertyDefinition = {
          propertyName: results[1].attribute.name,
          customLabel: results[1].view.displayName,
          labelOrientation: 'Top',
          kind: '',
          visible: true,
          editable: true
        };
        let type: any = results[1].attribute.type;
        type = (Array.isArray(type) ? type[0] : type); 
        switch (type) {
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
        defaultFormatDefinition.containers[0].contents.push(
          propertyDefinition);
        
        viewModel.formatDefinitions[formatDefinitionId] =
          defaultFormatDefinition;
        viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT] =
          formatDefinitionId;

        this._dataModel.localTypes[results[0]] = dataModel;
        viewModelProxy.item.localTypes[results[0]] = viewModel;
        
        this.save();
        this._itemRepository.upsertItem('KoheseView', viewModelProxy.item);
        
        // Re-enter edit mode
        this._editable = true;
        
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public async removeLocalType(name: string): Promise<void> {
    let choiceValue: any = await this._dialogService.openYesNoDialog(
      'Remove ' + name, 'All unsaved modifications to this kind are to be ' +
      'saved if this local type is removed. Do you want to proceed?');
    if (choiceValue) {
      let viewModel: any = TreeConfiguration.getWorkingTree().getProxyFor(
        'view-' + this._dataModel.name.toLowerCase()).item;
      delete this._dataModel.localTypes[name];
      delete viewModel.localTypes[name];
      
      this.save();
      this._itemRepository.upsertItem('KoheseView', viewModel);
      
      // Re-enter edit mode
      this._editable = true;
      
      this._changeDetectorRef.markForCheck();
    }
  }
  
  public async addAttribute(): Promise<void> {
    let viewModelProxy: ItemProxy;
    if (this._enclosingType) {
      viewModelProxy = TreeConfiguration.getWorkingTree().getProxyFor('view-' +
        this._enclosingType.name.toLowerCase());
    } else {
      viewModelProxy = TreeConfiguration.getWorkingTree().getProxyFor('view-' +
        this._dataModel.name.toLowerCase());
    }
    
    if (this._hasUnsavedChanges || viewModelProxy.dirty) {
      let response: any = await this._dialogService.openYesNoDialog(
        'Display Modifications', 'All unsaved modifications to this kind ' +
        'are to be saved if an attribute is added to this kind. Do you want ' +
        'to proceed?');
      if (!response) {
        return;
      }
    }
    
    this._dialogService.openComponentsDialog([{
      component: AttributeEditorComponent,
      matDialogData: {
        type: this._dataModel
      }
    }], { data: {} }).afterClosed().subscribe((results: Array<any>) => {
      if (results) {
        this._dataModel.properties[results[0].attribute.name] =
          results[0].attribute;
        let viewModel: any = (this._enclosingType ? viewModelProxy.item.
          localTypes[this._dataModel.name] : viewModelProxy.item);
        viewModel.viewProperties[results[0].attribute.name] =
          results[0].view;
        viewModel.formatDefinitions[viewModel.defaultFormatKey[
          FormatDefinitionType.DEFAULT]].containers[0].contents.push({
          propertyName: results[0].attribute.name,
          customLabel: results[0].view.displayName,
          labelOrientation: 'Top',
          kind: results[0].view.inputType.type,
          visible: true,
          editable: true
        });
        
        this.save();
        this._itemRepository.upsertItem('KoheseView', viewModelProxy.item);
        this._attributes.push(results[0].attribute);
        this._attributeTable.renderRows();
        
        // Re-enter edit mode
        this._editable = true;
        
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public sortAttributes(columnId: string, sortDirection: string): void {
    if (sortDirection) {
      if (columnId === 'Type') {
        this._attributes.sort((oneElement: any, anotherElement: any) => {
          let oneType: string = (Array.isArray(oneElement.type) ? oneElement.
            type[0] : oneElement.type);
          let anotherType: string = (Array.isArray(anotherElement.type) ?
            anotherElement.type[0] : anotherElement.type);
          if (sortDirection === 'asc') {
            return oneType.localeCompare(anotherType);
          } else {
            return anotherType.localeCompare(oneType);
          }
        });
      } else if (columnId === 'Is Multivalued') {
        this._attributes.sort((oneElement: any, anotherElement: any) => {
          let oneValue: number = (Array.isArray(oneElement.type) ? 1 : 0);
          let anotherValue: number = (Array.isArray(anotherElement.type) ? 1 :
            0);
          if (sortDirection === 'asc') {
            return oneValue - anotherValue;
          } else {
            return anotherValue - oneValue;
          }
        });
      } else if (columnId === 'Is Required') {
        this._attributes.sort((oneElement: any, anotherElement: any) => {
          let oneValue: number = (oneElement.required ? 1 : 0);
          let anotherValue: number = (anotherElement.required ? 1 : 0);
          if (sortDirection === 'asc') {
            return oneValue - anotherValue;
          } else {
            return anotherValue - oneValue;
          }
        });
      } else if (columnId === 'Is Kind ID') {
        this._attributes.sort((oneElement: any, anotherElement: any) => {
          let oneValue: number = (oneElement.id ? 1 : 0);
          let anotherValue: number = (anotherElement.id ? 1 : 0);
          if (sortDirection === 'asc') {
            return oneValue - anotherValue;
          } else {
            return anotherValue - oneValue;
          }
        });
      } else {
        let attributeName: string;
        switch (columnId) {
          case 'Name':
            attributeName = 'name';
            break;
          case 'Default Value':
            attributeName = 'default';
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
      for (let attributeName in this._dataModel.properties) {
        let attribute: any = this._dataModel.properties[attributeName];
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
  
  public setAttributeName(attribute: any, name: string): void {
    let attributeMap: any = this._dataModel.properties;
    let previousAttributeName: string = attribute.name;
    let intermediateMap: any = {};
    for (let attributeName in attributeMap) {
      if (attributeName === previousAttributeName) {
        intermediateMap[name] = attributeMap[attributeName];
      } else {
        intermediateMap[attributeName] = attributeMap[attributeName];
      }
      
      delete attributeMap[attributeName];
    }
    
    for (let attributeName in intermediateMap) {
      attributeMap[attributeName] = intermediateMap[attributeName];
    }
    
    attribute.name = name;
    this._modifiedEventEmitter.emit();
    this._changeDetectorRef.markForCheck();
  }
  
  public areTypesSame(option: any, selection: any): boolean {
    let selectionType: any;
    if (Array.isArray(selection)) {
      selectionType = selection[0];
    } else {
      selectionType = selection;
    }

    return (option === selectionType);
  }
  
  public async typeSelected(attribute: any, attributeType: string):
    Promise<void> {
    let viewModelProxy: ItemProxy = TreeConfiguration.getWorkingTree().
      getProxyFor('view-' + this._dataModel.name.toLowerCase());
    if (this._hasUnsavedChanges || viewModelProxy.dirty) {
      let response: any = await this._dialogService.openYesNoDialog(
        'Display Modifications', 'All unsaved modifications to this kind ' +
        'are to be saved if an attribute is added to this kind. Do you want ' +
        'to proceed?');
      if (!response) {
        return;
      }
    }
    
    if (Array.isArray(attribute.type)) {
      attribute.type = [attributeType];
    } else {
      attribute.type = attributeType;
    }
    
    if (attribute.type === 'string') {
      attribute.default = '';
    } else {
      delete attribute.default;
    }
    
    if (Object.values(this._fundamentalTypes).indexOf(attributeType) === -1) {
      if (!attribute.relation) {
        attribute.relation = {
          kind: 'Item',
          foreignKey: 'id'
        };
      }
      
      viewModelProxy.item.viewProperties[attribute.name].inputType.type = '';
    } else {
      delete attribute.relation;
      
      if (attributeType === 'string') {
        viewModelProxy.item.viewProperties[attribute.name].inputType.type =
          'text';
      } else if (attributeType === 'timestamp') {
        viewModelProxy.item.viewProperties[attribute.name].inputType.type =
          'date';
      } else {
        viewModelProxy.item.viewProperties[attribute.name].inputType.type =
          attributeType;
      }
    }
    
    this.save();
    this._itemRepository.upsertItem('KoheseView', viewModelProxy.item);
    
    // Re-enter edit mode
    this._editable = true;
        
    this._changeDetectorRef.markForCheck();
  }
  
  public openStateMachineEditor(attribute: any): void {
    let stateMachine: any = attribute.properties;
    if (stateMachine) {
      stateMachine = JSON.parse(JSON.stringify(stateMachine));
    } else {
      stateMachine = {
        state: {},
        transition: {}
      };
    }

    this._dialogService.openComponentDialog(StateMachineEditorComponent, {
      data: {
        stateMachine: stateMachine,
        defaultState: attribute.default
      }
    }).updateSize('70%', '70%').afterClosed().subscribe((data: any) => {
      if (data) {
        attribute.properties = data.stateMachine;
        attribute.default = data.defaultState;
        
        this._modifiedEventEmitter.emit();
      }
    });
  }
  
  public areRelationsEqual(option: any, selection: any): boolean {
    return ((option.kind === selection.kind) && (option.foreignKey ===
      selection.foreignKey));
  }
  
  public toggleMultivaluedness(attribute: any): void {
    let type: any = attribute.type;
    if (Array.isArray(type)) {
      type = type[0];
      if (type === 'string') {
        attribute.default = '';
      }
    } else {
      type = [type];
      delete attribute.default;
    }

    attribute.type = type;
    
    this._modifiedEventEmitter.emit();
    this._changeDetectorRef.markForCheck();
  }
  
  public async removeAttribute(propertyId: string): Promise<void> {
    let viewModel: any;
    if (this._enclosingType) {
      viewModel = TreeConfiguration.getWorkingTree().getProxyFor('view-' +
        this._enclosingType.name.toLowerCase()).item.localTypes[this.
        _dataModel.name];
    } else {
      viewModel = TreeConfiguration.getWorkingTree().getProxyFor('view-' +
        this._dataModel.name.toLowerCase()).item;
    }
    
    /* paths Element format: [<View Model>, <FormatDefinition ID>,
    <FormatContainer index>, <PropertyDefinition index>] */
    let paths: Array<Array<any>> = [];
    this._itemRepository.getTreeConfig().getValue().config.getRootProxy().
      visitTree({ includeOrigin: false }, (itemProxy: ItemProxy) => {
      if ((itemProxy.kind === 'KoheseView') && (itemProxy.item !==
        viewModel)) {
        let formatDefinitions: Array<FormatDefinition> = Object.values(
          itemProxy.item.formatDefinitions);
        for (let j: number = 0; j < formatDefinitions.length; j++) {
          for (let k: number = 0; k < formatDefinitions[j].containers.
            length; k++) {
            let formatContainer: FormatContainer = formatDefinitions[j].
              containers[k];
            if (formatContainer.kind === FormatContainerKind.
              REVERSE_REFERENCE_TABLE) {
              let propertyDefinitions: Array<PropertyDefinition> =
                formatContainer.contents.filter((propertyDefinition:
                PropertyDefinition) => {
                return ((propertyDefinition.propertyName.kind === this.
                  _dataModel.name) && (propertyDefinition.propertyName.
                  attribute === propertyId));
              });
              if (propertyDefinitions.length > 0) {
                for (let l: number = 0; l < propertyDefinitions.length;
                  l++) {
                  paths.push([itemProxy.item, formatDefinitions[j].id, k,
                    formatContainer.contents.indexOf(propertyDefinitions[l])]);
                }
              }
            } else {
              let isSubtype: boolean = false;
              let dataModelItemProxy: ItemProxy = this._itemRepository.
                getTreeConfig().getValue().config.getProxyFor(itemProxy.item.
                modelName);
              while (dataModelItemProxy) {
                if (dataModelItemProxy.item === this._dataModel) {
                  isSubtype = true;
                  break;
                }
                
                dataModelItemProxy = this._itemRepository.getTreeConfig().
                  getValue().config.getProxyFor(dataModelItemProxy.item.base);
              }
              
              if (isSubtype) {
                let entryIndex: number = formatContainer.contents.map(
                  (propertyDefinition: PropertyDefinition) => {
                  return propertyDefinition.propertyName;
                }).indexOf(propertyId);
                if (entryIndex !== -1) {
                  paths.push([itemProxy.item, formatDefinitions[j].id, k,
                    entryIndex]);
                }
              }
            }
          }
        }
      }
    }, undefined);
    
    let removeFromModels: () => void = () => {
      delete this._dataModel.properties[propertyId];
      delete viewModel.viewProperties[propertyId];
      let formatDefinitions: Array<FormatDefinition> = Object.values(viewModel.
        formatDefinitions);
      for (let j: number = 0; j < formatDefinitions.length; j++) {
        for (let k: number = 0; k < formatDefinitions[j].containers.length;
          k++) {
          let formatContainer: FormatContainer = formatDefinitions[j].
            containers[k];
          if (formatContainer.kind === FormatContainerKind.
            REVERSE_REFERENCE_TABLE) {
            let propertyDefinitions: Array<PropertyDefinition> =
              formatContainer.contents.filter((propertyDefinition:
              PropertyDefinition) => {
              return ((propertyDefinition.propertyName.kind === this.
                _dataModel.name) && (propertyDefinition.propertyName.attribute
                === propertyId));
            });
            if (propertyDefinitions.length > 0) {
              for (let l: number = 0; l < propertyDefinitions.length; l++) {
                formatContainer.contents.splice(formatContainer.contents.
                  indexOf(propertyDefinitions[l]), 1);
              }
            }
          } else {
            let entryIndex: number = formatContainer.contents.map(
              (propertyDefinition: PropertyDefinition) => {
              return propertyDefinition.propertyName;
            }).indexOf(propertyId);
            if (entryIndex !== -1) {
              formatContainer.contents.splice(entryIndex, 1);
            }
          }
        }
      }
      
      this.save();
      
      if (this._enclosingType) {
        this._itemRepository.upsertItem('KoheseView', TreeConfiguration.
          getWorkingTree().getProxyFor('view-' + this._enclosingType.name.
          toLowerCase()).item);
      } else {
        this._itemRepository.upsertItem('KoheseView', viewModel);
      }
      
      this._attributes.splice(Object.keys(this._dataModel.properties).indexOf(
        propertyId), 1);
      this._attributeTable.renderRows();
      
      // Re-enter edit mode
      this._editable = true;
    };
    
    if (paths.length === 0) {
      let choiceValue: any = await this._dialogService.openYesNoDialog(
        'Remove ' + propertyId, 'All unsaved modifications to this type are ' +
        'to be saved if this attribute is removed. Do you want to proceed?');
      if (choiceValue) {
        removeFromModels();
        this._changeDetectorRef.markForCheck();
      }
    } else {
      let choiceValue: any = await this._dialogService.openYesNoDialog(
        'Remove ' + propertyId, 'All unsaved modifications to this type are ' +
        'to be saved if this attribute is removed. Additionally, the ' +
        'following types are expected to have one or more Format Definition ' +
        'entries removed: ' + paths.map((path: Array<any>) => {
          return path[0].name;
      }).filter((viewModelName: string, index: number, source:
        Array<string>) => {
        return (source.indexOf(viewModelName) === index);
      }).join(', ') + '. Do you want to proceed?');
      if (choiceValue) {
        for (let j: number = 0; j < paths.length; j++) {
          let propertyDefinitions: Array<PropertyDefinition> = (paths[j][0][
          'formatDefinitions'][String(paths[j][1])]['containers'][
            (paths[j][2] as number)][
            'contents'] as Array<PropertyDefinition>);
          propertyDefinitions.splice((paths[j][3] as number), 1);
          this._itemRepository.upsertItem('KoheseView', paths[j][0]);
        }
        
        removeFromModels();
        this._changeDetectorRef.markForCheck();
      }
    }
  }
}
