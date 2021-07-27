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
  ViewChild, Output, EventEmitter, ElementRef } from '@angular/core';
import { MatTable } from '@angular/material';

// NPM
import * as Uuid from 'uuid';

// Kohese
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { AttributeEditorComponent } from '../attribute-editor/attribute-editor.component';
import { FormatDefinition, FormatDefinitionType } from '../../../../../common/src/FormatDefinition.interface';
import { FormatContainer, FormatContainerKind } from '../../../../../common/src/FormatContainer.interface';
import { PropertyDefinition } from '../../../../../common/src/PropertyDefinition.interface';
import { StateMachineEditorComponent } from '../../state-machine-editor/state-machine-editor.component';
import { InputDialogKind, InputDialogComponent } from '../../dialog/input-dialog/input-dialog.component';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { KoheseModel } from '../../../../../common/src/KoheseModel';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { Type, Metatype } from '../../../../../common/src/Type.interface';
import { KoheseDataModel, KoheseViewModel } from '../../../../../common/src/KoheseModel.interface';
import { Enumeration, EnumerationValue } from '../../../../../common/src/Enumeration.interface';

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

    if (this._enclosingType) {
      for (let localTypeName in this._enclosingType.classLocalTypes) {
        this._attributeTypes[localTypeName] = localTypeName;
      }
    } else {
      for (let localTypeName in this._dataModel.classLocalTypes) {
        this._attributeTypes[localTypeName] = localTypeName;
      }
    }

    TreeConfiguration.getWorkingTree().getRootProxy().visitTree(
      { includeOrigin: false }, (itemProxy: ItemProxy) => {
      if (itemProxy.kind === 'KoheseModel') {
        let item: any = itemProxy.item;
        let addType: boolean = true;
        let kindName: string = item.name;
        while (true) {
          if (kindName === this._dataModel.name) {
            addType = false;
            break;
          }

          let dataModelItemProxy: ItemProxy = TreeConfiguration.
            getWorkingTree().getProxyFor(kindName);
          if (dataModelItemProxy) {
            kindName = dataModelItemProxy.item.base;
          } else {
            break;
          }
        }

        if (addType) {
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

  @ViewChild('attributeTable', {static: false}) 'attributeTable' !: ElementRef;
  private _attributeTable: MatTable<any>;

  private _attributes: Array<any>;
  get attributes() {
    return this._attributes;
  }

  get itemRepository() {
    return this._itemRepository;
  }

  get Metatype() {
    return Metatype;
  }

  get Array() {
    return Array;
  }

  get Object() {
    return Object;
  }

  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    private _dialogService: DialogService, private _itemRepository:
    ItemRepository) {
  }

  /**
   * Saves the selected global type
   */
  public async save(): Promise<void> {
    this._editable = false;
    await this._itemRepository.upsertItem('KoheseModel', (this._enclosingType ?
      this._enclosingType : this._dataModel));
    this._changeDetectorRef.markForCheck();
  }

  public discardChanges(): void {
    this._itemRepository.fetchItem(TreeConfiguration.getWorkingTree().
      getProxyFor(this._dataModel.id));
    this._editable = false;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Determines if two references are refer to the same Item
   *
   * @param option
   * @param selection
   */
  public areNamespaceReferencesEqual(option: { id: string}, selection:
    { id: string }): boolean {
    if ((option == null) && (selection == null)) {
      return true;
    } else {
      if ((option != null) && (selection != null)) {
        return (option.id === selection.id);
      } else {
        return false;
      }
    }
  }

  public async parentTypeSelected(parentType: any): Promise<void> {
    let viewModelProxy: ItemProxy;
    let treeConfiguration: TreeConfiguration = this._itemRepository.
      getTreeConfig().getValue().config;
    if (this._enclosingType) {
      viewModelProxy = TreeConfiguration.getWorkingTree().getModelProxyFor(this._enclosingType.name).view;
    } else {
      viewModelProxy = TreeConfiguration.getWorkingTree().getModelProxyFor(this._dataModel.name).view;
    }

    let subtypeViewModels: Array<any> = [];
    if (!this._enclosingType) {
      treeConfiguration.getRootProxy().visitTree({ includeOrigin: false },
        (itemProxy: ItemProxy) => {
        if ((itemProxy.kind === 'KoheseView') && (itemProxy !==
          viewModelProxy)) {
          let dataModelItemProxy: ItemProxy = treeConfiguration.
            getProxyFor(itemProxy.item.modelName);
          while (dataModelItemProxy) {
            if (dataModelItemProxy.item === this._dataModel) {
              subtypeViewModels.push(itemProxy.item);
              break;
            }

            dataModelItemProxy = treeConfiguration.getProxyFor(
              dataModelItemProxy.item.base);
          }
        }
      }, undefined);

      subtypeViewModels.sort((oneViewModel: any, anotherViewModel: any) => {
        return oneViewModel.modelName.localeCompare(anotherViewModel.
          modelName);
      });
    }

    let title: string = '';
    let text: string = '';
    if (this._hasUnsavedChanges || viewModelProxy.dirty || (subtypeViewModels.
      length > 0)) {
      if (this._hasUnsavedChanges || viewModelProxy.dirty) {
        title += 'Display Modifications';
        text += 'All unsaved modifications to this kind are to be saved if ' +
          'an attribute is added to this kind.';
        if (subtypeViewModels.length > 0) {
          title += ' And Additional Type Modification';
          text += ' The following additional types are expected to have one ' +
            'or more Format Definitions modified upon the parent type of ' +
            'this type being changed, as well: ' + subtypeViewModels.map(
            (viewModel: any) => {
            return viewModel.modelName;
          }).join(', ') + '.';
        }
      } else {
        title += 'Additional Type Modification';
        text += 'The following additional types are expected to have one ' +
            'or more Format Definitions modified upon the parent type of ' +
            'this type being changed: ' + subtypeViewModels.map((viewModel:
            any) => {
          return viewModel.modelName;
        }).join(', ') + '.';
      }

      text += ' Do you want to proceed?';
      let response: any = await this._dialogService.openYesNoDialog(title,
        text);
      if (!response) {
        return;
      }
    }

    let defaultFormatDefinition: FormatDefinition = viewModelProxy.item.
      formatDefinitions[viewModelProxy.item.defaultFormatKey[
      FormatDefinitionType.DEFAULT]];
    if (!viewModelProxy.item.ungroupDefaultFormatDefinitionStateAttributes) {
      if (Object.values(this._dataModel.classProperties).filter(
        (attributeEntry: any) => {
        let type: any = attributeEntry.definition.type;
        type = (Array.isArray(type) ? type[0] : type);
        return (type === 'StateMachine');
      }).length > 0) {
        defaultFormatDefinition.containers[1].contents.length = 0;
      }
    }
    defaultFormatDefinition.containers[0].contents.length = 0;

    let parentTypeViewModel: any = (TreeConfiguration.getWorkingTree().getProxyFor(parentType.id) as KoheseModel).view.item;

    if (viewModelProxy.item.parentId !== parentTypeViewModel.id) {
      viewModelProxy.item.parentId = parentTypeViewModel.id;
    }

    let parentTypeDefaultFormatDefinition: FormatDefinition =
      parentTypeViewModel.formatDefinitions[parentTypeViewModel.
      defaultFormatKey[FormatDefinitionType.DEFAULT]];
    for (let j: number = 0; j < parentTypeDefaultFormatDefinition.containers[
      0].contents.length; j++) {
      defaultFormatDefinition.containers[0].contents.push(JSON.parse(JSON.
        stringify(parentTypeDefaultFormatDefinition.containers[0].contents[
        j])));
    }
    if (!parentTypeViewModel.ungroupDefaultFormatDefinitionStateAttributes) {
      let parentTypeDataModel: any = treeConfiguration.getProxyFor(
        parentTypeViewModel.modelName).item;
      if (Object.values(parentTypeDataModel.classProperties).filter(
        (attributeEntry: any) => {
        let type: any = attributeEntry.definition.type;
        type = (Array.isArray(type) ? type[0] : type);
        return (type === 'StateMachine');
      }).length > 0) {
        /* At this point, _dataModel has not yet had its parentType changed.
        Should there be no state attributes in the previous hierarchy for this
        type, add an empty FormatContainer to the default FormatDefinition
        (since it should not have had an automatically-added state
        FormatContainer). */
        if (Object.values(this._dataModel.classProperties).filter(
          (attributeEntry: any) => {
          let type: any = attributeEntry.definition.type;
          type = (Array.isArray(type) ? type[0] : type);
          return (type === 'StateMachine');
        }).length === 0) {
          // No state attribute container should already be present
          defaultFormatDefinition.containers.splice(1, 0, {
            kind: FormatContainerKind.VERTICAL,
            contents: []
          });
        }

        for (let j: number = 0; j < parentTypeDefaultFormatDefinition.containers[
          1].contents.length; j++) {
          defaultFormatDefinition.containers[1].contents.push(JSON.parse(JSON.
            stringify(parentTypeDefaultFormatDefinition.containers[1].contents[
            j])));
        }
      }
    }

    let stateFormatContainerAdded: boolean = false;
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

      if ((attributeType === 'StateMachine') && !viewModelProxy.item.
        ungroupDefaultFormatDefinitionStateAttributes) {
        if ((Object.values(this._dataModel.classProperties).filter(
          (attributeEntry: any) => {
          let type: any = attributeEntry.definition.type;
          type = (Array.isArray(type) ? type[0] : type);
          return (type === 'StateMachine');
        }).length === 0) && !stateFormatContainerAdded) {
          defaultFormatDefinition.containers.splice(1, 0, {
            kind: FormatContainerKind.VERTICAL,
            contents: [propertyDefinition]
          });
          stateFormatContainerAdded = true;
        } else {
          defaultFormatDefinition.containers[1].contents.push(
            propertyDefinition);
        }
      } else {
        defaultFormatDefinition.containers[0].contents.push(
          propertyDefinition);
      }
    }

    this._dataModel.base = parentType.name;
    this._dataModel.parentId = parentType.name;

    for (let j: number = 0; j < subtypeViewModels.length; j++) {
      let subtypeDefaultFormatDefinition: FormatDefinition = subtypeViewModels[
        j].formatDefinitions[subtypeViewModels[j].defaultFormatKey[
        FormatDefinitionType.DEFAULT]];
      let subtypeDataModel: any = treeConfiguration.getProxyFor(
        subtypeViewModels[j].modelName).item;
      if (!subtypeViewModels[j].
        ungroupDefaultFormatDefinitionStateAttributes) {
        if (Object.values(subtypeDataModel.classProperties).filter(
          (attributeEntry: any) => {
          let type: any = attributeEntry.definition.type;
          type = (Array.isArray(type) ? type[0] : type);
          return (type === 'StateMachine');
        }).length > 0) {
          subtypeDefaultFormatDefinition.containers[1].contents.length = 0;
        }
      }
      subtypeDefaultFormatDefinition.containers[0].contents.length = 0;

      for (let j: number = 0; j < defaultFormatDefinition.containers[
        0].contents.length; j++) {
        subtypeDefaultFormatDefinition.containers[0].contents.push(JSON.parse(
          JSON.stringify(defaultFormatDefinition.containers[0].contents[j])));
      }
      if (!viewModelProxy.item.ungroupDefaultFormatDefinitionStateAttributes) {
        /* Due to classProperties not being updated within a session, the
        conditional below might evaluate incorrectly. */
        if (Object.values(this._dataModel.classProperties).filter(
          (attributeEntry: any) => {
          let type: any = attributeEntry.definition.type;
          type = (Array.isArray(type) ? type[0] : type);
          return (type === 'StateMachine');
        }).length > 0) {
          if (Object.values(subtypeDataModel.classProperties).filter(
            (attributeEntry: any) => {
            let type: any = attributeEntry.definition.type;
            type = (Array.isArray(type) ? type[0] : type);
            return (type === 'StateMachine');
          }).length === 0) {
            // No state attribute container should already be present
            subtypeDefaultFormatDefinition.containers.splice(1, 0, {
              kind: FormatContainerKind.VERTICAL,
              contents: []
            });
          }

          for (let j: number = 0; j < defaultFormatDefinition.containers[1].
            contents.length; j++) {
            subtypeDefaultFormatDefinition.containers[1].contents.push(JSON.
              parse(JSON.stringify(defaultFormatDefinition.containers[1].
              contents[j])));
          }
        }
      }

      stateFormatContainerAdded = false;
      for (let attributeName in subtypeDataModel.properties) {
        let propertyDefinition: PropertyDefinition = {
          propertyName: attributeName,
          customLabel: attributeName,
          labelOrientation: 'Top',
          kind: '',
          visible: true,
          editable: true
        };
        let attributeType: any = subtypeDataModel.properties[attributeName].
          type;
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

        if ((attributeType === 'StateMachine') && !viewModelProxy.item.
          ungroupDefaultFormatDefinitionStateAttributes) {
          /* Due to classProperties not being updated within a session, the
          conditional below might evaluate incorrectly. */
          if ((Object.values(this._dataModel.classProperties).filter(
            (attributeEntry: any) => {
            let type: any = attributeEntry.definition.type;
            type = (Array.isArray(type) ? type[0] : type);
            return (type === 'StateMachine');
          }).length === 0) && !stateFormatContainerAdded) {
            subtypeDefaultFormatDefinition.containers.splice(1, 0, {
              kind: FormatContainerKind.VERTICAL,
              contents: [propertyDefinition]
            });
            stateFormatContainerAdded = true;
          } else {
            subtypeDefaultFormatDefinition.containers[1].contents.push(
              propertyDefinition);
          }
        } else {
          subtypeDefaultFormatDefinition.containers[0].contents.push(
            propertyDefinition);
        }
      }

      this._itemRepository.upsertItem('KoheseView', subtypeViewModels[j]);
    }

    this._modifiedEventEmitter.emit();

    await this.save();
    await this._itemRepository.upsertItem('KoheseView', viewModelProxy.item);

    // Re-enter edit mode
    this._editable = true;

    this._changeDetectorRef.markForCheck();
  }

  public areParentTypeValuesEqual(option: any, selection: string): boolean {
    return (option.name === selection);
  }

  /**
   * Adds a local type of the given Metatype to the selected data model
   *
   * @param metatype
   */
  public async addLocalType(metatype: Metatype): Promise<void> {
    let viewModelProxy: ItemProxy = TreeConfiguration.getWorkingTree().
      getModelProxyFor(this._dataModel.id).view;
    if (this._hasUnsavedChanges || viewModelProxy.dirty) {
      let response: any = await this._dialogService.openYesNoDialog(
        'Display Modifications', 'All unsaved modifications to this kind ' +
        'are to be saved if a local type is added to this kind. Do you want ' +
        'to proceed?');
      if (!response) {
        return;
      }
    }

    let localTypeDataModel: Type;
    let localTypeViewModel: Type;
    if (metatype === Metatype.ENUMERATION) {
      let name: string = await this._dialogService.openInputDialog('Add ' +
        metatype, '', InputDialogKind.STRING, 'Name', metatype, (value:
        any) => {
        return (value && !(this._enclosingType ? this._enclosingType : this.
          _dataModel).classLocalTypes[value]);
      });

      if (!name) {
        return;
      }

      localTypeDataModel = ({
        metatype: Metatype.ENUMERATION,
        id: name,
        name: name,
        values: []
      } as Enumeration);
      localTypeViewModel = ({
        metatype: Metatype.ENUMERATION,
        id: 'view-' + name.toLowerCase(),
        name: name,
        values: []
      } as Enumeration);
    } else {
      let results: Array<any> = await this._dialogService.
        openComponentsDialog([{
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
        matDialogData: {
          contextualGlobalType: this._dataModel
        },
        label: 'Attribute'
      }], { data: {} }).updateSize('90%', '90%').afterClosed().toPromise();

      if (!results) {
        return;
      }

      let koheseDataModel: KoheseDataModel = {
        metatype: metatype,
        id: results[0],
        name: results[0],
        base: null,
        idInjection: true,
        properties: {},
        validations: [],
        relations: {},
        acls: [],
        methods: []
      };
      koheseDataModel.properties[results[1].attribute.name] = results[1].
        attribute;

      let koheseViewModel: KoheseViewModel = {
        metatype: metatype,
        id: 'view-' + results[0].toLowerCase(),
        name: results[0],
        modelName: results[0],
        icon: '',
        color: '#000000',
        viewProperties: {},
        formatDefinitions: {},
        defaultFormatKey: {},
        tableDefinitions: {}
      };
      koheseViewModel.viewProperties[results[1].attribute.name] = results[
        1].view;

      let formatDefinitionId: string = Uuid.v1();
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

      if (type === 'StateMachine') {
        defaultFormatDefinition.containers.push({
          kind: FormatContainerKind.VERTICAL,
          contents: [propertyDefinition]
        });
      } else {
        defaultFormatDefinition.containers[0].contents.push(
          propertyDefinition);
      }

      koheseViewModel.formatDefinitions[formatDefinitionId] =
        defaultFormatDefinition;
      koheseViewModel.defaultFormatKey[FormatDefinitionType.DEFAULT] =
        formatDefinitionId;

      localTypeDataModel = koheseDataModel;
      localTypeViewModel = koheseViewModel;
    }

    this._dataModel.localTypes[localTypeDataModel.name] = localTypeDataModel;
    viewModelProxy.item.localTypes[localTypeViewModel.name] =
      localTypeViewModel;

    await this.save();
    await this._itemRepository.upsertItem('KoheseView', viewModelProxy.item);

    // Re-enter edit mode
    this._editable = true;

    this._changeDetectorRef.markForCheck();
  }

  public async removeLocalType(name: string): Promise<void> {
    let choiceValue: any = await this._dialogService.openYesNoDialog(
      'Remove ' + name, 'All unsaved modifications to this kind are to be ' +
      'saved if this local type is removed. Do you want to proceed?');
    if (choiceValue) {
      let viewModel: any = TreeConfiguration.getWorkingTree().getModelProxyFor(this._dataModel.id).view.item;
      delete this._dataModel.localTypes[name];
      delete viewModel.localTypes[name];

      await this.save();
      await this._itemRepository.upsertItem('KoheseView', viewModel);

      // Re-enter edit mode
      this._editable = true;

      this._changeDetectorRef.markForCheck();
    }
  }

  public async addAttribute(): Promise<void> {
    let viewModelProxy: ItemProxy;
    let workingTree: TreeConfiguration = TreeConfiguration.getWorkingTree();
    if (this._enclosingType) {
      viewModelProxy = workingTree.getModelProxyFor(this._enclosingType.id).view;
    } else {
      viewModelProxy = workingTree.getModelProxyFor(this._dataModel.id).view;
    }

    let subtypeViewModels: Array<any> = [];
    if (!this._enclosingType) {
      workingTree.getRootProxy().visitTree({ includeOrigin: false },
        (itemProxy: ItemProxy) => {
        if ((itemProxy.kind === 'KoheseView') && (itemProxy !==
          viewModelProxy)) {
          let dataModelItemProxy: ItemProxy = workingTree.
            getProxyFor(itemProxy.item.modelName);
          while (dataModelItemProxy) {
            if (dataModelItemProxy.item === this._dataModel) {
              subtypeViewModels.push(itemProxy.item);
              break;
            }

            dataModelItemProxy = workingTree.getProxyFor(
              dataModelItemProxy.item.base);
          }
        }
      }, undefined);

      subtypeViewModels.sort((oneViewModel: any, anotherViewModel: any) => {
        return oneViewModel.modelName.localeCompare(anotherViewModel.
          modelName);
      });
    }

    let title: string = '';
    let text: string = '';
    if (this._hasUnsavedChanges || viewModelProxy.dirty || (subtypeViewModels.
      length > 0)) {
      if (this._hasUnsavedChanges || viewModelProxy.dirty) {
        title += 'Display Modifications';
        text += 'All unsaved modifications to this kind are to be saved if ' +
          'an attribute is added to this kind.';
        if (subtypeViewModels.length > 0) {
          title += ' And Additional Type Modification';
          text += ' The following additional types are expected to have an ' +
            'entry added to their default Format Definition upon a new ' +
            'attribute being added to the selected type, as well: ' +
            subtypeViewModels.map((viewModel: any) => {
            return viewModel.modelName;
          }).join(', ') + '.';
        }
      } else {
        title += 'Additional Type Modification';
        text += 'The following additional types are expected to have an ' +
          'entry added to their default Format Definition upon a new ' +
          'attribute being added to the selected type: ' + subtypeViewModels.
          map((viewModel: any) => {
          return viewModel.modelName;
        }).join(', ') + '.';
      }

      text += ' Do you want to proceed?';
      let response: any = await this._dialogService.openYesNoDialog(title,
        text);
      if (!response) {
        return;
      }
    }

    this._dialogService.openComponentsDialog([{
      component: AttributeEditorComponent,
      matDialogData: {
        contextualGlobalType: (this._enclosingType ? this._enclosingType :
          this._dataModel)
      }
    }], { data: {} }).afterClosed().subscribe(async (results: Array<any>) => {
      if (results) {
        let viewModel: any = (this._enclosingType ? viewModelProxy.item.
          localTypes[this._dataModel.name] : viewModelProxy.item);
        let propertyDefinition: PropertyDefinition = {
          propertyName: results[0].attribute.name,
          customLabel: results[0].view.displayName,
          labelOrientation: 'Top',
          kind: results[0].view.inputType.type,
          visible: true,
          editable: true
        };
        let defaultFormatDefinition: FormatDefinition = viewModel.
          formatDefinitions[viewModel.defaultFormatKey[FormatDefinitionType.
          DEFAULT]];
        if ((propertyDefinition.kind === 'state-editor') && !viewModel.
          ungroupDefaultFormatDefinitionStateAttributes) {
          if (Object.values(this._dataModel.classProperties).filter(
            (attributeEntry: any) => {
            let type: any = attributeEntry.definition.type;
            type = (Array.isArray(type) ? type[0] : type);
            return (type === 'StateMachine');
          }).length === 0) {
 	          defaultFormatDefinition.containers.splice(1, 0, {
              kind: FormatContainerKind.VERTICAL,
              contents: [propertyDefinition]
            });
          } else {
            defaultFormatDefinition.containers[1].contents.push(
              propertyDefinition);
          }
        } else {
          defaultFormatDefinition.containers[0].contents.push(
            propertyDefinition);
        }

        let attributeNames: Array<string> = Object.keys(this._dataModel.
          properties);
        for (let j: number = 0; j < subtypeViewModels.length; j++) {
          defaultFormatDefinition = subtypeViewModels[j].formatDefinitions[
            subtypeViewModels[j].defaultFormatKey[FormatDefinitionType.
            DEFAULT]];
          if ((propertyDefinition.kind === 'state-editor') &&
            !subtypeViewModels[j].
            ungroupDefaultFormatDefinitionStateAttributes) {
            let subtypeDataModel: any = workingTree.getProxyFor(
              subtypeViewModels[j].modelName).item;
            if (Object.values(subtypeDataModel.classProperties).filter(
              (attributeEntry: any) => {
              let type: any = attributeEntry.definition.type;
              type = (Array.isArray(type) ? type[0] : type);
              return (type === 'StateMachine');
            }).length === 0) {
              defaultFormatDefinition.containers.splice(1, 0, {
                kind: FormatContainerKind.VERTICAL,
                contents: [propertyDefinition]
              });
            } else {
              let propertyDefinitionNames: Array<string> =
                defaultFormatDefinition.containers[1].contents.map((definition:
                PropertyDefinition) => {
                return definition.propertyName;
              });
              let insertionIndex: number = Math.max(...attributeNames.map(
                (attributeName: string) => {
                return propertyDefinitionNames.indexOf(attributeName);
              }));
              defaultFormatDefinition.containers[1].contents.splice(
                insertionIndex + 1, 0, propertyDefinition);
            }
          } else {
            let insertionIndex: number = defaultFormatDefinition.
              containers[0].contents.map((definition:
              PropertyDefinition) => {
              return definition.propertyName;
            }).indexOf(attributeNames[attributeNames.length - 1]);
            defaultFormatDefinition.containers[0].contents.splice(
              insertionIndex + 1, 0, propertyDefinition);
          }

          this._itemRepository.upsertItem('KoheseView', subtypeViewModels[j]);
        }

        this._dataModel.properties[results[0].attribute.name] =
          results[0].attribute;
        viewModel.viewProperties[results[0].attribute.name] =
          results[0].view;

        await this.save();
        await this._itemRepository.upsertItem('KoheseView', viewModelProxy.item);
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
    let viewModelProxy: ItemProxy;
    let workingTree: TreeConfiguration = TreeConfiguration.getWorkingTree();
    if (this._enclosingType) {
      viewModelProxy = workingTree.getProxyFor(this._enclosingType.id);
    } else {
      viewModelProxy = workingTree.getProxyFor(this._dataModel.id);
    }

    let subtypeViewModels: Array<any> = [];
    if (!this._enclosingType) {
      workingTree.getRootProxy().visitTree({ includeOrigin: false },
        (itemProxy: ItemProxy) => {
        if ((itemProxy.kind === 'KoheseView') && (itemProxy !==
          viewModelProxy)) {
          let dataModelItemProxy: ItemProxy = workingTree.
            getProxyFor(itemProxy.item.modelName);
          while (dataModelItemProxy) {
            if (dataModelItemProxy.item === this._dataModel) {
              subtypeViewModels.push(itemProxy.item);
              break;
            }

            dataModelItemProxy = workingTree.getProxyFor(
              dataModelItemProxy.item.base);
          }
        }
      }, undefined);

      subtypeViewModels.sort((oneViewModel: any, anotherViewModel: any) => {
        return oneViewModel.modelName.localeCompare(anotherViewModel.
          modelName);
      });
    }

    let title: string = '';
    let text: string = '';
    if (this._hasUnsavedChanges || viewModelProxy.dirty || (subtypeViewModels.
      length > 0)) {
      if (this._hasUnsavedChanges || viewModelProxy.dirty) {
        title += 'Display Modifications';
        text += 'All unsaved modifications to this kind are to be saved if ' +
          'an attribute is added to this kind.';
        if (subtypeViewModels.length > 0) {
          title += ' And Additional Type Modification';
          text += ' The following additional types are expected to have one ' +
            'or more Format Definitions modified upon the type of this ' +
            'attribute being modified, as well: ' +
            subtypeViewModels.map((viewModel: any) => {
            return viewModel.modelName;
          }).join(', ') + '.';
        }
      } else {
        title += 'Additional Type Modification';
        text += 'The following additional types are expected to have one ' +
            'or more Format Definitions modified upon the type of this ' +
            'attribute being modified: ' + subtypeViewModels.
          map((viewModel: any) => {
          return viewModel.modelName;
        }).join(', ') + '.';
      }

      text += ' Do you want to proceed?';
      let response: any = await this._dialogService.openYesNoDialog(title,
        text);
      if (!response) {
        return;
      }
    }

    let previousAttributeTypeName: string = (Array.isArray(attribute.type) ?
      attribute.type[0] : attribute.type);

    let viewModel: any;
    if (this._enclosingType) {
      let definedInKind = this._enclosingType.classLocalTypes[this._dataModel.name].definedInKind;
      let modelProxy = TreeConfiguration.getWorkingTree().getModelProxyFor(definedInKind);
      viewModel = modelProxy.view.item.localTypes[this._dataModel.name];
    } else {
      viewModel = viewModelProxy.item;
    }

    let subtypeViewModelsToUpdate: Array<any> = [];
    let attributeNames: Array<string> = Object.keys(this._dataModel.
      classProperties);
    if ((previousAttributeTypeName === 'StateMachine') || (attributeType ===
      'StateMachine')) {
      let attributeNames: Array<string> = Object.keys(this._dataModel.
        properties);
      let changeContainer: (formatDefinition: FormatDefinition) => void;
      if (previousAttributeTypeName === 'StateMachine') {
        changeContainer = (formatDefinition: FormatDefinition) => {
          let attributeIndex: number = formatDefinition.containers[1].contents.
            map((propertyDefinition: PropertyDefinition) => {
            return propertyDefinition.propertyName;
          }).indexOf(attribute.name);
          let propertyDefinition: PropertyDefinition = formatDefinition.
            containers[1].contents.splice(attributeIndex, 1)[0];
          if (formatDefinition.containers[1].contents.length === 0) {
            formatDefinition.containers.splice(1, 1);
          }

          formatDefinition.containers[0].contents.splice(Object.keys(this.
            _dataModel.classProperties).indexOf(attribute.name) - 1, 0,
            propertyDefinition);
        };
      } else {
        changeContainer = (formatDefinition: FormatDefinition) => {
          let attributeIndex: number = formatDefinition.containers[0].contents.
            map((propertyDefinition: PropertyDefinition) => {
            return propertyDefinition.propertyName;
          }).indexOf(attribute.name);
          let propertyDefinition: PropertyDefinition = formatDefinition.
            containers[0].contents.splice(attributeIndex, 1)[0];
          if (Object.values(this._dataModel.classProperties).filter(
            (attributeEntry: any) => {
            let type: any = attributeEntry.definition.type;
            type = (Array.isArray(type) ? type[0] : type);
            return (type === 'StateMachine');
          }).length === 0) {
            formatDefinition.containers.splice(1, 0, {
              kind: FormatContainerKind.VERTICAL,
              contents: [propertyDefinition]
            });
          } else {
            let propertyDefinitionNames: Array<string> = formatDefinition.
              containers[1].contents.map((definition: PropertyDefinition) => {
              return definition.propertyName;
            });
            let insertionIndex: number = Math.max(...attributeNames.map(
              (attributeName: string) => {
              return propertyDefinitionNames.indexOf(attributeName);
            }));
            formatDefinition.containers[1].contents.splice(insertionIndex + 1,
              0, propertyDefinition);
          }
        };
      }

      let defaultFormatDefinition: FormatDefinition = viewModel.
        formatDefinitions[viewModel.defaultFormatKey[FormatDefinitionType.
        DEFAULT]];
      changeContainer(defaultFormatDefinition);

      for (let j: number = 0; j < subtypeViewModels.length; j++) {
        defaultFormatDefinition = subtypeViewModels[j].formatDefinitions[
          subtypeViewModels[j].defaultFormatKey[FormatDefinitionType.
          DEFAULT]];
        changeContainer(defaultFormatDefinition);

        for (let formatDefinitionId in subtypeViewModels[j].
          formatDefinitions) {
          let formatDefinition: FormatDefinition = subtypeViewModels[j].
            formatDefinitions[formatDefinitionId];
          for (let k: number = 0; k < formatDefinition.containers.length;
            k++) {
            let formatContainer: FormatContainer = formatDefinition.containers[
              k];
            if (formatContainer.kind === FormatContainerKind.
              REVERSE_REFERENCE_TABLE) {
              if ((Object.values(this._fundamentalTypes).indexOf(
                previousAttributeTypeName) === -1) && (Object.values(this.
                _fundamentalTypes).indexOf(attributeType) !== -1)) {
                for (let l: number = (formatContainer.contents.length - 1); l
                  >= 0; l--) {
                  let propertyDefinition: PropertyDefinition = formatContainer.
                    contents[l];
                  if ((propertyDefinition.propertyName.kind === this.
                    _dataModel.name) && (propertyDefinition.propertyName.
                    attribute === attribute.name)) {
                    formatContainer.contents.splice(l, 1);
                  }
                }
              }
            } else {
              for (let l: number = 0; l < formatContainer.contents.length;
                l++) {
                let propertyDefinition: PropertyDefinition = formatContainer.
                  contents[l];
                if (propertyDefinition.propertyName === attribute.name) {
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
                    default:
                      propertyDefinition.kind = '';
                  }
                }
              }
            }
          }
        }

        subtypeViewModelsToUpdate.push(subtypeViewModels[j]);
      }
    }

    for (let formatDefinitionId in viewModel.formatDefinitions) {
      let formatDefinition: FormatDefinition = viewModel.formatDefinitions[
        formatDefinitionId];
      for (let k: number = 0; k < formatDefinition.containers.length;
        k++) {
        let formatContainer: FormatContainer = formatDefinition.containers[
          k];
        if (formatContainer.kind === FormatContainerKind.
          REVERSE_REFERENCE_TABLE) {
          if ((Object.values(this._fundamentalTypes).indexOf(
            previousAttributeTypeName) === -1) && (Object.values(this.
            _fundamentalTypes).indexOf(attributeType) !== -1)) {
            for (let l: number = (formatContainer.contents.length - 1); l >=
              0; l--) {
              let propertyDefinition: PropertyDefinition = formatContainer.
                contents[l];
              if ((propertyDefinition.propertyName.kind === this.
                _dataModel.name) && (propertyDefinition.propertyName.
                attribute === attribute.name)) {
                formatContainer.contents.splice(l, 1);
              }
            }
          }
        } else {
          for (let l: number = 0; l < formatContainer.contents.length;
            l++) {
            let propertyDefinition: PropertyDefinition = formatContainer.
              contents[l];
            if (propertyDefinition.propertyName === attribute.name) {
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
                default:
                  propertyDefinition.kind = '';
              }
            }
          }
        }
      }
    }

    for (let j: number = 0; j < subtypeViewModels.length; j++) {
      for (let formatDefinitionId in subtypeViewModels[j].formatDefinitions) {
        let formatDefinition: FormatDefinition = subtypeViewModels[j].
          formatDefinitions[formatDefinitionId];
        for (let k: number = 0; k < formatDefinition.containers.length; k++) {
          let formatContainer: FormatContainer = formatDefinition.containers[
            k];
          if (formatContainer.kind === FormatContainerKind.
            REVERSE_REFERENCE_TABLE) {
            if ((Object.values(this._fundamentalTypes).indexOf(
              previousAttributeTypeName) === -1) && (Object.values(this.
              _fundamentalTypes).indexOf(attributeType) !== -1)) {
              for (let l: number = (formatContainer.contents.length - 1); l >=
                0; l--) {
                let propertyDefinition: PropertyDefinition = formatContainer.
                  contents[l];
                if ((propertyDefinition.propertyName.kind === this._dataModel.
                  name) && (propertyDefinition.propertyName.attribute ===
                  attribute.name)) {
                  formatContainer.contents.splice(l, 1);
                }
              }
            }
          } else {
            for (let l: number = 0; l < formatContainer.contents.length; l++) {
              let propertyDefinition: PropertyDefinition = formatContainer.
                contents[l];
              if (propertyDefinition.propertyName === attribute.name) {
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
                  default:
                    propertyDefinition.kind = '';
                }
              }
            }
          }
        }
      }

      if (subtypeViewModelsToUpdate.indexOf(subtypeViewModels[j]) === -1) {
        subtypeViewModelsToUpdate.push(subtypeViewModels[j]);
      }
    }

    for (let j: number = 0; j < subtypeViewModelsToUpdate.length; j++) {
      this._itemRepository.upsertItem('KoheseView', subtypeViewModelsToUpdate[
        j]);
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
      if (this._enclosingType ? this._enclosingType.classLocalTypes[
        attributeType].definition : this._dataModel.classLocalTypes[
        attributeType].definition) {
        attribute.relation = {
          contained: true
        };
      } else {
        if (!attribute.relation || attribute.relation.contained) {
          attribute.relation = {
            kind: 'Item',
            foreignKey: 'id'
          };
        }
      }

      viewModel.viewProperties[attribute.name].inputType.type = '';
    } else {
      delete attribute.relation;

      if (attributeType === 'string') {
        viewModel.viewProperties[attribute.name].inputType.type =
          'text';
      } else if (attributeType === 'timestamp') {
        viewModel.viewProperties[attribute.name].inputType.type =
          'date';
      } else if (attributeType === 'StateMachine') {
        viewModel.viewProperties[attribute.name].inputType.type =
          'state-editor';
      } else {
        viewModel.viewProperties[attribute.name].inputType.type =
          attributeType;
      }
    }

    await this.save();
    await this._itemRepository.upsertItem('KoheseView', viewModelProxy.item);

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
    return (selection && (option.kind === selection.kind) && (option.foreignKey
      === selection.foreignKey));
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
      let definedInKind = this._enclosingType.classLocalTypes[this._dataModel.name].definedInKind;
      let modelProxy = TreeConfiguration.getWorkingTree().getModelProxyFor(definedInKind);
      viewModel = modelProxy.view.item.localTypes[this._dataModel.name];
    } else {
      viewModel = TreeConfiguration.getWorkingTree().getModelProxyFor(this._dataModel.id).view.item;
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

    let attribute: any = this._dataModel.properties[propertyId];
    let type: any = attribute.type;
    type = (Array.isArray(type) ? type[0] : type);
    let removeFromModels: () => Promise<void> = async () => {
      delete this._dataModel.properties[propertyId];
      delete viewModel.viewProperties[propertyId];
      let formatDefinitions: Array<FormatDefinition> = Object.values(viewModel.
        formatDefinitions);
      let defaultFormatDefinitionId: string = viewModel.defaultFormatKey[
        FormatDefinitionType.DEFAULT];
      for (let j: number = 0; j < formatDefinitions.length; j++) {
        for (let k: number = (formatDefinitions[j].containers.length - 1); k >=
          0; k--) {
          let formatContainer: FormatContainer = formatDefinitions[j].
            containers[k];
          let isDefaultFormatDefinitionStateAttributeFormatContainer: boolean =
            ((formatDefinitions[j].id === defaultFormatDefinitionId) &&
            !viewModel.ungroupDefaultFormatDefinitionStateAttributes);
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

          if ((type === 'StateMachine') &&
            isDefaultFormatDefinitionStateAttributeFormatContainer &&
            (formatContainer.contents.length === 0)) {
            formatDefinitions[j].containers.splice(k, 1);
          }
        }
      }

      await this.save();

      if (this._enclosingType) {
        await this._itemRepository.upsertItem('KoheseView', TreeConfiguration.
          getWorkingTree().getModelProxyFor(this._enclosingType.id).view.item);
      } else {
        await this._itemRepository.upsertItem('KoheseView', viewModel);
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
        await removeFromModels();
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
          let formatDefinitionId: string = String(paths[j][1]);
          let formatDefinition: FormatDefinition = (paths[j][0][
            'formatDefinitions'][formatDefinitionId] as FormatDefinition);
          let formatContainer: FormatContainer = formatDefinition.containers[
            paths[j][2] as number];
          let isDefaultFormatDefinitionStateAttributeFormatContainer: boolean =
            ((paths[j][0]['defaultFormatKey'][FormatDefinitionType.DEFAULT] ===
            formatDefinitionId) && !paths[j][0][
            'ungroupDefaultFormatDefinitionStateAttributes']);
          formatContainer.contents.splice((paths[j][3] as number), 1);
          if ((type === 'StateMachine') &&
            isDefaultFormatDefinitionStateAttributeFormatContainer &&
            (formatContainer.contents.length === 0)) {
            formatDefinition.containers.splice(formatDefinition.containers.
              indexOf(formatContainer), 1);
          }

          this._itemRepository.upsertItem('KoheseView', paths[j][0]);
        }

        await removeFromModels();
        this._changeDetectorRef.markForCheck();
      }
    }
  }

  public async addEnumerationValue(enumeration: Enumeration): Promise<void> {
    let modelId = (this._enclosingType ? this._enclosingType : this._dataModel).id;
    let viewModelProxy: ItemProxy = TreeConfiguration.getWorkingTree().getModelProxyFor(modelId).view;
    if (this._hasUnsavedChanges || viewModelProxy.dirty) {
      let response: any = await this._dialogService.openYesNoDialog(
        'Display Modifications', 'All unsaved modifications to this kind ' +
        'are to be saved if a value is added to this enumeration. Do you ' +
        'want to proceed?');
      if (!response) {
        return;
      }
    }

    let enumerationValueName: any = await this._dialogService.
      openInputDialog('Enumeration Value', '', InputDialogKind.STRING, 'Name',
      'Enumeration Value', (input: any) => {
      return (input && (enumeration.values.map((enumerationValue:
        EnumerationValue) => {
        return enumerationValue.name;
      }).indexOf(input) === -1));
    });
    if (enumerationValueName) {
      enumeration.values.push({
        name: enumerationValueName.toString(),
        description: ''
      });

      viewModelProxy.item.localTypes[enumeration.name].values.push(
        enumerationValueName.toString());

      await this.save();
      await this._itemRepository.upsertItem('KoheseView', viewModelProxy.item);

      this._changeDetectorRef.markForCheck();
    }
  }

  public async removeEnumerationValue(enumeration: Enumeration,
    enumerationValue: EnumerationValue): Promise<void> {
    let modelId = (this._enclosingType ? this._enclosingType : this._dataModel).id;
    let viewModelProxy: ItemProxy = TreeConfiguration.getWorkingTree().getModelProxyFor(modelId).view;
    if (this._hasUnsavedChanges || viewModelProxy.dirty) {
      let response: any = await this._dialogService.openYesNoDialog(
        'Display Modifications', 'All unsaved modifications to this kind ' +
        'are to be saved if this value is removed from this enumeration. Do ' +
        'you want to proceed?');
      if (!response) {
        return;
      }
    }

    let enumerationValueIndex: number = enumeration.values.indexOf(
      enumerationValue);
    enumeration.values.splice(enumerationValueIndex, 1);
    viewModelProxy.item.localTypes[enumeration.name].values.splice(
      enumerationValueIndex, 1);

    await this.save();
    await this._itemRepository.upsertItem('KoheseView', viewModelProxy.item);

    this._changeDetectorRef.markForCheck();
  }
}
