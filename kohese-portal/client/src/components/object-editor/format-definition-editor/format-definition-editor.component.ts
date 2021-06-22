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


import { Component, ChangeDetectionStrategy, ChangeDetectorRef,
  Input, OnInit } from '@angular/core';

import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { FormatDefinition,
  FormatDefinitionType } from '../../../../../common/src/FormatDefinition.interface';
import { FormatContainer,
  FormatContainerKind } from '../../../../../common/src/FormatContainer.interface';
import { PropertyDefinition } from '../../../../../common/src/PropertyDefinition.interface';
import { TableDefinition } from '../../../../../common/src/TableDefinition.interface';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { KoheseModel } from '../../../../../common/src/KoheseModel';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { Type, Metatype } from '../../../../../common/src/Type.interface';

@Component({
  selector: 'format-definition-editor',
  templateUrl: './format-definition-editor.component.html',
  styleUrls: ['./format-definition-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormatDefinitionEditorComponent implements OnInit {
  private _enclosingType: any;
  @Input('enclosingType')
  set enclosingType(enclosingType: any) {
    this._enclosingType = enclosingType;
  }

  private _dataModel: any;
  get dataModel() {
    return this._dataModel;
  }
  @Input('dataModel')
  set dataModel(dataModel: any) {
    this._dataModel = dataModel;
  }

  private _viewModel: any;
  get viewModel() {
    return this._viewModel;
  }
  @Input('viewModel')
  set viewModel(viewModel: any) {
    this._viewModel = viewModel;
  }

  private _formatDefinition: FormatDefinition;
  get formatDefinition() {
    return this._formatDefinition;
  }
  @Input('formatDefinition')
  set formatDefinition(formatDefinition: FormatDefinition) {
    this._formatDefinition = formatDefinition;

    this._isDefaultFormatDefinition = (this._viewModel.defaultFormatKey[
      FormatDefinitionType.DEFAULT] === this._formatDefinition.id);
  }

  private _attributes: Array<any>;
  get attributes() {
    return this._attributes;
  }
  @Input('attributes')
  set attributes(attributes: Array<any>) {
    this._attributes = attributes;
  }

  private _referenceAttributes: { [kindName: string]: Array<any> } = {};
  get referenceAttributes() {
    return this._referenceAttributes;
  }

  private _isDisabled: boolean = false;
  get isDisabled() {
    return this._isDisabled;
  }
  @Input('disabled')
  set isDisabled(isDisabled: boolean) {
    this._isDisabled = isDisabled;
  }

  private _isDefaultFormatDefinition: boolean;
  get isDefaultFormatDefinition() {
    return this._isDefaultFormatDefinition;
  }

  private _userInterfaceTypes: any = {
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

  get FormatContainerKind() {
    return FormatContainerKind;
  }

  get Object() {
    return Object;
  }

  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    private _itemRepository: ItemRepository) {
  }

  public ngOnInit(): void {
    let typeNames: Array<string> = [];
    let dataModelItemProxy: ItemProxy = ({
      item: this._dataModel
    } as ItemProxy);
    do {
      typeNames.push(dataModelItemProxy.item.name);
      dataModelItemProxy = TreeConfiguration.getWorkingTree().getProxyFor(
        dataModelItemProxy.item.base);
    } while (dataModelItemProxy);

    TreeConfiguration.getWorkingTree().getRootProxy().visitTree(
      { includeOrigin: false }, (itemProxy: ItemProxy) => {
      if (itemProxy.kind === 'KoheseModel') {
        for (let attributeName in itemProxy.item.properties) {
          let attribute: any = itemProxy.item.properties[attributeName];
          attribute.name = attributeName;
          if (attribute.relation) {
            let typeName: string = (Array.isArray(attribute.type) ?
              attribute.type[0] : attribute.type);
            if (typeNames.indexOf(typeName) !== -1) {
              let kindAttributes: Array<any> = this._referenceAttributes[
                itemProxy.item.name];
              if (!kindAttributes) {
                kindAttributes = [];
                this._referenceAttributes[itemProxy.item.name] =
                  kindAttributes;
              }

              let attributeCopy: any = JSON.parse(JSON.stringify(attribute));
              attributeCopy.containingType = itemProxy.item.name;
              kindAttributes.push(attributeCopy);
            }
          }
        }
      }
    }, undefined);
  }

  public toggleStateAttributeGrouping(): void {
    if (!this._viewModel.ungroupDefaultFormatDefinitionStateAttributes) {
      if (Object.values(this._dataModel.classProperties).filter(
        (attributeEntry: any) => {
        let type: any = attributeEntry.definition.type;
        type = (Array.isArray(type) ? type[0] : type);
        return (type === 'StateMachine');
      }).length > 0) {
        let attributeNames: Array<string> = Object.keys(this._dataModel.
          classProperties);
        this._formatDefinition.containers[1].contents.reverse();
        for (let j: number = (this._formatDefinition.containers[1].contents.
          length - 1); j >= 0; j--) {
          let propertyDefinition: PropertyDefinition = this._formatDefinition.
            containers[1].contents.splice(j, 1)[0];
          /* Adjust insertion index based on 'name' being present in the
          header */
          this._formatDefinition.containers[0].contents.splice(attributeNames.
            indexOf(propertyDefinition.propertyName) - 1, 0, propertyDefinition);
        }

        this._formatDefinition.containers.splice(1, 1);
      }
    } else {
      let formatContainer: FormatContainer = {
        kind: FormatContainerKind.VERTICAL,
        contents: []
      };

      for (let j: number = (this._formatDefinition.containers[0].contents.
        length - 1); j >= 0; j--) {
        let propertyDefinition: PropertyDefinition = this._formatDefinition.
          containers[0].contents[j];
        if (propertyDefinition.kind === 'state-editor') {
          this._formatDefinition.containers[0].contents.splice(j, 1);
          formatContainer.contents.unshift(propertyDefinition);
        }
      }

      this._formatDefinition.containers.splice(1, 0, formatContainer);
    }

    this._viewModel.ungroupDefaultFormatDefinitionStateAttributes = !this.
      _viewModel.ungroupDefaultFormatDefinitionStateAttributes;
    console.log(this._viewModel.ungroupDefaultFormatDefinitionStateAttributes);
  }

  public doesPropertyDefinitionMatchSelection(option: any, selection: any):
    boolean {
    return ((option.kind === selection.kind) && (option.attribute ===
      selection.attribute));
  }

  public getSelectableAttributes(): Array<any> {
    if ((this._enclosingType ? this._enclosingType : this._dataModel).
      localTypes) {
      return this._attributes.filter((attribute: any) => {
        let typeName: string = (Array.isArray(attribute.type) ? attribute.type[
          0] : attribute.type);
        let classLocalTypesEntry: any = (this._enclosingType ? this.
          _enclosingType : this._dataModel).classLocalTypes[typeName];
        let hasFormatDefinition : boolean = false;
        let isEnumeration : boolean = (classLocalTypesEntry && classLocalTypesEntry.definition.metatype === Metatype.ENUMERATION);
        if (classLocalTypesEntry && !isEnumeration) {
          let modelProxy : KoheseModel = TreeConfiguration.getWorkingTree().getModelProxyFor(classLocalTypesEntry.definedInKind);
          hasFormatDefinition = (Object.values(modelProxy.view.item.localTypes[typeName].formatDefinitions).length > 0);
        }
        return (!classLocalTypesEntry ||
          isEnumeration ||
          hasFormatDefinition);
      });
    } else {
      return this._attributes;
    }
  }

  public attributeSelected(attributeName: string, propertyDefinition:
    PropertyDefinition): void {
    propertyDefinition.propertyName = attributeName;
    propertyDefinition.customLabel = attributeName;
    propertyDefinition.visible = true;
    propertyDefinition.tableDefinition = '';

    let attribute: any = this._dataModel.classProperties[attributeName].
      definition;
    propertyDefinition.editable = !attribute.derived;
    let userInterfaceType: string = '';
    let attributeType: string = (Array.isArray(attribute.type) ? attribute.
      type[0] : attribute.type);
    switch (attributeType) {
      case 'boolean':
        userInterfaceType = 'boolean';
        break;
      case 'number':
        userInterfaceType = 'number';
        break;
      case 'string':
        userInterfaceType = 'text';
        break;
      case 'StateMachine':
        userInterfaceType = 'state-editor';
        break;
      case 'timestamp':
        userInterfaceType = 'date';
        break;
      case 'user-selector':
        userInterfaceType = 'user-selector';
        break;
    }
    propertyDefinition.kind = userInterfaceType;

    if ((this._enclosingType ? this._enclosingType : this._dataModel).
      localTypes) {
      let dataModelType: any = this._dataModel.classProperties[attributeName].
        definition.type;
      let typeName: string = (Array.isArray(dataModelType) ? dataModelType[0] :
        dataModelType);
      let definedInKind = (this._enclosingType ? this._enclosingType : this._dataModel).classLocalTypes[typeName].definedInKind;
      let definedInModelProxy : KoheseModel = TreeConfiguration.getWorkingTree().getModelProxyFor(definedInKind);
      let localTypeViewModelEntry: any = definedInModelProxy.view.item.localTypes[typeName];
      if (localTypeViewModelEntry) {
        propertyDefinition.formatDefinition = Object.values(
          localTypeViewModelEntry.formatDefinitions)[0]['id'];
      } else {
        delete propertyDefinition.formatDefinition;
      }
    }

    this._changeDetectorRef.markForCheck();
  }

  public getFormatContainerPanelTitle(formatContainer: FormatContainer):
    string {
    if (formatContainer.kind === FormatContainerKind.REVERSE_REFERENCE_TABLE) {
      return formatContainer.contents.map((propertyDefinition:
        PropertyDefinition) => {
        return propertyDefinition.propertyName.attribute;
      }).join(', ');
    } else {
      return formatContainer.contents.map((propertyDefinition:
        PropertyDefinition) => {
        return propertyDefinition.propertyName;
      }).join(', ');
    }
  }

  public addFormatContainer(formatContainerKind: FormatContainerKind): void {
    this._formatDefinition.containers.push({
      kind: formatContainerKind,
      contents: []
    });
  }

  public removeFormatContainer(formatContainer: FormatContainer): void {
    this._formatDefinition.containers.splice(this._formatDefinition.containers.
      indexOf(formatContainer), 1);
  }

  public addAttribute(formatContainer: FormatContainer): void {
    let propertyDefinition: PropertyDefinition;
    if (formatContainer.kind === FormatContainerKind.
      REVERSE_REFERENCE_TABLE) {
      let kindName: string = Object.keys(this._referenceAttributes)[0];
      let attribute: any = this._referenceAttributes[kindName][0];
      propertyDefinition = {
        propertyName: {
          kind: kindName,
          attribute: attribute.name
        },
        customLabel: '',
        labelOrientation: 'Top',
        kind: '',
        formatDefinition: undefined,
        tableDefinition: '',
        visible: true,
        editable: false
      };
    } else {
      let attribute: any = this._dataModel.classProperties[Object.keys(this.
        _dataModel.classProperties)[0]].definition;
      let userInterfaceType: string = '';
      let attributeType: string = (Array.isArray(attribute.type) ? attribute.
        type[0] : attribute.type);
      switch (attributeType) {
        case 'boolean':
          userInterfaceType = 'boolean';
          break;
        case 'number':
          userInterfaceType = 'number';
          break;
        case 'string':
          userInterfaceType = 'text';
          break;
        case 'StateMachine':
          userInterfaceType = 'state-editor';
          break;
        case 'timestamp':
          userInterfaceType = 'date';
          break;
        case 'user-selector':
          userInterfaceType = 'user-selector';
          break;
      }

      let formatDefinitionId: string;
      if ((this._enclosingType ? this._enclosingType : this._dataModel).
        localTypes) {
        let classLocalTypesEntry: any = (this._enclosingType ? this.
          _enclosingType : this._dataModel).classLocalTypes[attributeType];
        if (classLocalTypesEntry) {
          let modelProxy : KoheseModel = TreeConfiguration.getWorkingTree().getModelProxyFor(classLocalTypesEntry.definedInKind);
          let formatDefinitions: Array<FormatDefinition> = Object.values(
            modelProxy.view.item.localTypes[attributeType].formatDefinitions);
          if (formatDefinitions.length > 0) {
            formatDefinitionId = formatDefinitions[0].id;
          }
        }
      }

      propertyDefinition = {
        propertyName: attribute.name,
        customLabel: attribute.name,
        labelOrientation: 'Top',
        kind: userInterfaceType,
        formatDefinition: formatDefinitionId,
        tableDefinition: '',
        visible: true,
        editable: true
      };
    }

    formatContainer.contents.push(propertyDefinition);
  }

  public getUserInterfaceTypes(propertyDefinition: PropertyDefinition):
    Array<string> {
    let type: any = this._dataModel.classProperties[propertyDefinition.
      propertyName].definition.type;
    type = (Array.isArray(type) ? type[0] : type);
    if ((type === 'string') && this._dataModel.classProperties[
      propertyDefinition.propertyName].definition.relation) {
      return Object.keys(this._userInterfaceTypes['user-selector']);
    } else if (this._userInterfaceTypes[type]) {
      return Object.keys(this._userInterfaceTypes[type]);
    } else {
      let classLocalTypesEntry: { definedInKind: string, definition: Type } =
        (this._enclosingType ? this._enclosingType : this._dataModel).
        classLocalTypes[type];
      if (classLocalTypesEntry && (classLocalTypesEntry.definition.metatype ===
        Metatype.ENUMERATION)) {
        return ['Dropdown'];
      } else {
        return ['Reference'];
      }
    }
  }

  public getUserInterfaceTypeValue(propertyDefinition: PropertyDefinition,
    userInterfaceType: string): string {
    if ((userInterfaceType === 'Reference') || (userInterfaceType ===
      'Dropdown')) {
      return '';
    } else {
      if ((userInterfaceType === Object.keys(this._userInterfaceTypes[
        'user-selector'])[0]) && this._dataModel.classProperties[
        propertyDefinition.propertyName].definition.relation) {
        return 'user-selector';
      } else {
        let type: any = this._dataModel.classProperties[propertyDefinition.
          propertyName].definition.type;
        type = (Array.isArray(type) ? type[0] : type);
        return this._userInterfaceTypes[type][userInterfaceType];
      }
    }
  }

  public areUserInterfaceTypeValuesEqual(option: string, selection: string):
    boolean {
    if ((option === '') && (selection === 'proxy-selector')) {
      return true;
    } else if ((option === 'state-editor') && (selection === 'StateMachine')) {
      return true;
    } else {
      return (option === selection);
    }
  }

  public getLocalTypeFormatDefinitions(propertyDefinition: PropertyDefinition):
    Array<FormatDefinition> {
    let dataModelType: any = this._dataModel.classProperties[
      propertyDefinition.propertyName].definition.type;
    let typeName: string = (Array.isArray(dataModelType) ? dataModelType[0] :
      dataModelType);
    let definedInKind = (this._enclosingType ? this._enclosingType : this._dataModel).classLocalTypes[typeName].definedInKind;
    let definedInKindProxy : KoheseModel = TreeConfiguration.getWorkingTree().getModelProxyFor(definedInKind);
    return Object.values(definedInKindProxy.view.item.localTypes[typeName].formatDefinitions);
  }

  public isMultivaluedReferenceAttribute(propertyDefinition:
    PropertyDefinition): boolean {
    for (let j: number = 0; j < this._attributes.length; j++) {
      if ((this._attributes[j].name === propertyDefinition.propertyName) &&
        this._attributes[j].relation && Array.isArray(this._attributes[j].
        type)) {
        return true;
      }
    }

    return false;
  }

  public getTableDefinitions(propertyDefinition: PropertyDefinition):
    Array<TableDefinition> {
    let attributeTypeName: string = this._attributes.filter((attribute:
      any) => {
      return (attribute.name === propertyDefinition.propertyName);
    })[0].type[0];

    let classLocalTypes: any = (this._enclosingType ? this._enclosingType :
      this._dataModel).classLocalTypes;
    if (classLocalTypes && classLocalTypes[attributeTypeName]) {
      let definedInKind = (this._enclosingType ? this._enclosingType : this._dataModel).classLocalTypes[attributeTypeName].definedInKind;
      let definedInKindProxy : KoheseModel = TreeConfiguration.getWorkingTree().getProxyFor(definedInKind) as KoheseModel
      return Object.values(definedInKindProxy.view.item.localTypes[attributeTypeName].
        tableDefinitions);
    } else {
      let attributeKindProxy : KoheseModel = TreeConfiguration.getWorkingTree().getProxyFor(attributeTypeName) as KoheseModel;
      return Object.values(attributeKindProxy.view.item.tableDefinitions);
    }
  }

  public removeAttribute(formatContainer: FormatContainer, propertyDefinition:
    PropertyDefinition): void {
    formatContainer.contents.splice(formatContainer.contents.indexOf(
      propertyDefinition), 1);
  }

  public mayMove(formatContainer: FormatContainer, propertyDefinition:
    PropertyDefinition, moveUp: boolean): boolean {
    let index: number = formatContainer.contents.indexOf(propertyDefinition);
    if (moveUp) {
      return (index !== 0);
    } else {
      return (index !== (formatContainer.contents.length - 1));
    }
  }

  public move(formatContainer: FormatContainer, propertyDefinition:
    PropertyDefinition, moveUp: boolean): void {
    let index: number = formatContainer.contents.indexOf(propertyDefinition);
    formatContainer.contents.splice(index, 1);
    if (moveUp) {
      formatContainer.contents.splice(index - 1, 0, propertyDefinition);
    } else {
      formatContainer.contents.splice(index + 1, 0, propertyDefinition);
    }
  }
}
