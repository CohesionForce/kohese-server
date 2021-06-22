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


import { ChangeDetectorRef, Input } from '@angular/core';

import { Attribute } from '../../../../../../common/src/Attribute.interface';
import { FormatDefinition,
  FormatDefinitionType } from '../../../../../../common/src/FormatDefinition.interface';
import { ItemProxy } from '../../../../../../common/src/item-proxy';
import { KoheseModel } from '../../../../../../common/src/KoheseModel';
import { KoheseDataModel, KoheseViewModel } from '../../../../../../common/src/KoheseModel.interface';
import { PropertyDefinition } from '../../../../../../common/src/PropertyDefinition.interface';
import { TreeConfiguration } from '../../../../../../common/src/tree-configuration';
import { Type, Metatype } from '../../../../../../common/src/Type.interface';
import { TreeComponent } from '../../../../components/tree/tree.component';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';
import { SessionService } from '../../../../services/user/session.service';
import { FormatContainer,
  FormatContainerKind } from '../../../../../../common/src/FormatContainer.interface';

/**
 * Displays an attribute based on the given PropertyDefinition
 */
export class Field {
  protected _koheseObject: any;
  get koheseObject() {
    return this._koheseObject;
  }
  @Input('koheseObject')
  set koheseObject(koheseObject: any) {
    this._koheseObject = koheseObject;
  }

  protected _dataModel: KoheseDataModel;
  get dataModel() {
    return this._dataModel;
  }
  @Input('dataModel')
  set dataModel(dataModel: KoheseDataModel) {
    this._dataModel = dataModel;
    this._isVariantField = (this._dataModel.metatype === Metatype.VARIANT);
  }

  protected _viewModel: KoheseViewModel;
  get viewModel() {
    return this._viewModel;
  }
  @Input('viewModel')
  set viewModel(viewModel: KoheseViewModel) {
    this._viewModel = viewModel;
  }

  protected _enclosingDataModel: KoheseDataModel;
  get enclosingDataModel() {
    return this._enclosingDataModel;
  }
  @Input('enclosingDataModel')
  set enclosingDataModel(enclosingDataModel: KoheseDataModel) {
    this._enclosingDataModel = enclosingDataModel;
  }

  protected _propertyDefinition: PropertyDefinition;
  get propertyDefinition() {
    return this._propertyDefinition;
  }
  @Input('propertyDefinition')
  set propertyDefinition(propertyDefinition: PropertyDefinition) {
    this._propertyDefinition = propertyDefinition;
  }

  protected _formatDefinitionType: FormatDefinitionType;
  get formatDefinitionType() {
    return this._formatDefinitionType;
  }
  @Input('formatDefinitionType')
  set formatDefinitionType(formatDefinitionType: FormatDefinitionType) {
    this._formatDefinitionType = formatDefinitionType;
  }

  protected _isVariantField: boolean = false;
  get isVariantField() {
    return this._isVariantField;
  }

  get Object() {
    return Object;
  }

  get Array() {
    return Array;
  }

  get Metatype() {
    return Metatype;
  }

  get changeDetectorRef() {
    return this._changeDetectorRef;
  }

  get itemRepository() {
    return this._itemRepository;
  }

  get sessionService() {
    return this._sessionService;
  }

  protected constructor(protected _changeDetectorRef: ChangeDetectorRef,
    protected _itemRepository: ItemRepository, protected _dialogService:
    DialogService, protected _sessionService: SessionService) {
  }

  /**
   * Returns the representation of an attribute based on the associated
   * PropertyDefinition
   */
  public getAttributeRepresentation(): string {
    // Only customLabel should be used in the first part of the statement below
    return ((this._propertyDefinition.customLabel ? this._propertyDefinition.
      customLabel : this._propertyDefinition.propertyName) + (this._dataModel[
      'classProperties'][this._propertyDefinition.propertyName].definition.
      required ? '*' : ''));
  }

  /**
   * Returns an ISO-format Date representation for the given number of
   * milliseconds since January 1, 1970
   *
   * @param timestamp
   */
  public getDateString(timestamp: number): string {
    if (timestamp == null) {
      return undefined;
    }

    return new Date(timestamp).toISOString();
  }

  /**
   * Returns the names of states to which the attribute corresponding to the
   * associated PropertyDefinition may be transitioned
   */
  public getStateTransitionCandidates(): Array<string> {
    let stateTransitionCandidates: Array<string> = [];
    let currentStateName: string = this._koheseObject[this._isVariantField ?
      'value' : this._propertyDefinition.propertyName];
    let stateMachine: any = this._dataModel['classProperties'][
      this._propertyDefinition.propertyName].definition.properties;
    for (let transitionName in stateMachine.transition) {
      if (stateMachine.transition[transitionName].source ===
        currentStateName) {
        stateTransitionCandidates.push(transitionName);
      }
    }

    return stateTransitionCandidates;
  }

  /**
   * Returns whether the attribute represented by the associated
   * PropertyDefinition is a local type-typed attribute
   */
  public isLocalTypeAttribute(): boolean {
    let type: any = (this._enclosingDataModel ? this._enclosingDataModel :
      this._dataModel);
    let attribute: any = this._dataModel['classProperties'][this.
      _propertyDefinition.propertyName].definition;
    let typeName: string = (Array.isArray(attribute.type) ? attribute.type[
      0] : attribute.type);
    return ((type.classLocalTypes != null) && (type.classLocalTypes[typeName]
      != null));
  }

  /**
   * Allows selection of one or more references for the attribute corresponding
   * to the associated PropertyDefinition
   *
   * This method is used for the following cases:
   *   - Selecting a value for a singlevalued attribute
   *   - Adding values to a multivalued attribute
   *   - Replacing a single value of a multivalued attribute
   *
   * The given index is expected to be ```null``` in the second case;
   * otherwise, it should be a number.
   *
   * @param attributeName
   * @param index
   */
  public async openObjectSelector(index: number): Promise<void> {
    let attributeName: string = this._propertyDefinition.propertyName;
    let attribute: Attribute = this._dataModel['classProperties'][
      attributeName].definition;
    let treeConfiguration: TreeConfiguration = this._itemRepository.
      getTreeConfig().getValue().config;
    let allowMultiselect: boolean = (Array.isArray(attribute.type) && (index ==
      null));
    let selection: Array<any>;
    if (allowMultiselect) {
      selection = this._koheseObject[this._isVariantField ? 'value' :
        attributeName].map((reference: any) => {
        return treeConfiguration.getProxyFor(reference.id);
      });
    } else {
      if (index == null) {
        if (this._koheseObject[this._isVariantField ? 'value' :
          attributeName]) {
          selection = [treeConfiguration.getProxyFor(((attributeName ===
            'parentId') && !this._enclosingDataModel) ? this._koheseObject[
            this._isVariantField ? 'value' : attributeName] : this.
            _koheseObject[this._isVariantField ? 'value' : attributeName].id).
            item];
        } else {
          selection = [];
        }
      } else {
        if (this._koheseObject[this._isVariantField ? 'value' : attributeName][
          index]) {
          selection = [treeConfiguration.getProxyFor(this._koheseObject[this.
            _isVariantField ? 'value' : attributeName][index].id).item];
        } else {
          selection = [];
        }
      }
    }

    selection = await this._dialogService.openComponentDialog(TreeComponent, {
      data: {
        root: treeConfiguration.getRootProxy(),
        getChildren: (element: any) => {
          return (element as ItemProxy).children;
        },
        getText: (element: any) => {
          return (element as ItemProxy).item.name;
        },
        maySelect: (element: any) => {
          let type: any = this._dataModel['classProperties'][
            attributeName].definition.type;
          type = (Array.isArray(type) ? type[0] : type);
          if (type === 'Item') {
            return true;
          }

          let elementTypeName: string = (element as ItemProxy).kind;
          if ((attributeName === 'parentId') && !this._enclosingDataModel) {
            let objectItemProxy: ItemProxy = treeConfiguration.getProxyFor(
              this._koheseObject[this._isVariantField ? 'value' : 'id']);
            let itemProxy: ItemProxy = (element as ItemProxy);
            while (itemProxy) {
              if (itemProxy === objectItemProxy) {
                return false;
              }

              itemProxy = itemProxy.parentProxy;
            }

            return true;
          } else {
            while (true) {
              if (elementTypeName === type) {
                return true;
              }

              let itemProxy: ItemProxy = treeConfiguration.getProxyFor(
                elementTypeName);
              if (itemProxy) {
                elementTypeName = itemProxy.item.base;
              } else {
                break;
              }
            }
          }

          return false;
        },
        getIcon: (element: any) => {
          return (element as ItemProxy).model.view.item.icon;
        },
        selection: selection,
        allowMultiselect: allowMultiselect,
        showSelections: allowMultiselect,
        quickSelectElements: this._itemRepository.getRecentProxies()
      }
    }).updateSize('90%', '90%').afterClosed().toPromise();

    if (selection) {
      if (allowMultiselect) {
        this._koheseObject[this._isVariantField ? 'value' : attributeName].
          length = 0;
        this._koheseObject[this._isVariantField ? 'value' : attributeName].
          push(...selection.map((element: any) => {
          return { id: (element as ItemProxy).item.id };
        }));
      } else {
        if (Array.isArray(attribute.type)) {
          this._koheseObject[this._isVariantField ? 'value' : attributeName][
            index] = { id: selection[0].item.id };
        } else {
          let id: string = selection[0].item.id;
          if (attributeName === 'parentId') {

            let changeParentId: boolean = true;
            if (this._koheseObject.$proxy) {
              let currentObjectProxy = this._koheseObject.$proxy
              let newParentProxy: ItemProxy = treeConfiguration.getProxyFor(id);
              let oldParentProxyRepo = currentObjectProxy.parentProxy.getRepositoryProxy();
              let newParentProxyRepo = newParentProxy.getRepositoryProxy();

              if (oldParentProxyRepo !== newParentProxyRepo) {
                // The targetingName is the name of the item being moved
                // The targetName is the repository name selected in which to move targetingName.
                let newParentRepoName = newParentProxyRepo.item.name;
                let oldParentRepoName = oldParentProxyRepo.item.name;
                let currentObjectName = currentObjectProxy.item.name;

                // Truncate, trim, and add ellipses if any names are too long.
                if (currentObjectName.length >= 40) {
                  currentObjectName = currentObjectName.slice(0, 40).trim() + '...';
                }
                if (oldParentRepoName.length >= 40) {
                  oldParentRepoName = oldParentRepoName.slice(0, 40).trim() + '...';
                }
                if (newParentRepoName.length >= 40) {
                  newParentRepoName = newParentRepoName.slice(0, 40).trim() + '...';
                }

                changeParentId = await this._dialogService.openSimpleDialog(
                  'Changing parent for ' + currentObjectName,
                  'Upon save, this will move ' + (currentObjectProxy.getDescendantCountInSameRepo() + 1) + ' item(s) from the ' + oldParentRepoName +
                  ' repository to the ' + newParentRepoName + ' repository.',
                  {
                    acceptLabel: 'Allow',
                    cancelLabel: 'Cancel'
                  });
              }
            }

            if (changeParentId) {
              this._koheseObject[this._isVariantField ? 'value' : attributeName] = id;
            }
          } else {
            this._koheseObject[this._isVariantField ? 'value' :
              attributeName] = { id: id };
          }
        }
      }

      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * Returns an appropriate default value for the associated PropertyDefinition
   */
  public getDefaultValue(): any {
    let attribute: Attribute = this._dataModel['classProperties'][this.
      _propertyDefinition.propertyName].definition;
    let defaultValue: any = attribute.default;
    if (defaultValue != null) {
      return defaultValue;
    }

    let type: any = (Array.isArray(attribute.type) ? attribute.type[0] :
      attribute.type);
    // 'state-editor' case should be handled by the 'if' above
    switch (type) {
      case 'boolean':
        return false;
      case 'number':
        return 0;
      case 'timestamp':
        return new Date().getTime();
      case 'string':
        if (attribute.relation) {
          // 'username' attribute reference
          return 'admin';
        } else {
          return '';
        }
      default:
        if (this.isLocalTypeAttribute()) {
          let classLocalTypesEntry: any = (this._enclosingDataModel ? this.
            _enclosingDataModel : this._dataModel)['classLocalTypes'][type];
          let localTypeDataModel: any = classLocalTypesEntry.definition;
          if (localTypeDataModel.metatype === Metatype.ENUMERATION) {
            return null;
          } else if (localTypeDataModel.metatype === Metatype.VARIANT) {
            return {
              discriminant: Object.keys(localTypeDataModel.properties)[0],
              value: null
            };
          }

          let localTypeInstance: any = {};
          for (let attributeName in localTypeDataModel.classProperties) {
            let localTypeAttribute: any = localTypeDataModel.classProperties[
              attributeName].definition;
            let localTypeAttributeTypeName: string = (Array.isArray(
              localTypeAttribute.type) ? localTypeAttribute.type[0] :
              localTypeAttribute.type);
            localTypeInstance[attributeName] = localTypeAttribute.default;
            if (localTypeInstance[attributeName] == null) {
              if (Array.isArray(localTypeAttribute.type)) {
                localTypeInstance[attributeName] = [];
              } else {
                let classLocalTypesEntry:
                  { definedInKind: string, definition: any } = (this.
                  _enclosingDataModel ? this._enclosingDataModel : this.
                  _dataModel)['classLocalTypes'][localTypeAttributeTypeName];
                if (classLocalTypesEntry) {
                  if (classLocalTypesEntry.definition.metatype === Metatype.
                    ENUMERATION) {
                    localTypeInstance[attributeName] = null;
                  } else if (classLocalTypesEntry.definition.metatype ===
                    Metatype.VARIANT) {
                    localTypeInstance[attributeName] = {
                      discriminant: Object.keys(classLocalTypesEntry.
                        definition.properties)[0],
                      value: null
                    };
                  }
                } else {
                  /* 'state-editor' case should be handled by the attribute's
                  default value */
                  switch (localTypeAttributeTypeName) {
                    case 'boolean':
                      localTypeInstance[attributeName] = false;
                      break;
                    case 'number':
                      localTypeInstance[attributeName] = 0;
                      break;
                    case 'timestamp':
                      localTypeInstance[attributeName] = new Date().getTime();
                      break;
                    case 'string':
                      if (localTypeAttribute.relation) {
                        // 'username' attribute reference
                        localTypeInstance[attributeName] = 'admin';
                      } else {
                        localTypeInstance[attributeName] = '';
                      }
                      break;
                    default:
                      // Do nothing for now
                  }
                }
              }
            }
          }

          return localTypeInstance;
        }
    }
  }

  /**
   * @param option A dropdown option
   * @param selection The value of a certain Variant-typed attribute
   */
  public areVariantDiscriminantsEqual(option: { discriminant: string,
    value: any }, selection: { discriminant: string, value: any }): boolean {
    return ((selection != null) && (option.discriminant === selection.
      discriminant));
  }

  /**
   * Returns the local type data model corresponding to the type of attribute
   * corresponding to the associated PropertyDefinition
   */
  public getLocalTypeDataModel(): Type {
    let type: any = this._dataModel['classProperties'][this.
      _propertyDefinition.propertyName].definition.type;
    type = (Array.isArray(type) ? type[0] : type);
    return (this._enclosingDataModel ? this._enclosingDataModel : this.
      _dataModel)['classLocalTypes'][type].definition;
  }

  /**
   * Returns the local type view model corresponding to the type of attribute
   * corresponding to the associated PropertyDefinition
   */
  public getLocalTypeViewModel(): Type {
    let type: any = this._dataModel['classProperties'][this.
      _propertyDefinition.propertyName].definition.type;
    type = (Array.isArray(type) ? type[0] : type);
    let classLocalTypesEntry: { definedInKind: string, definition: any } =
      (this._enclosingDataModel ? this._enclosingDataModel : this._dataModel)[
      'classLocalTypes'][type];
    let definedInModelProxy : KoheseModel = TreeConfiguration.getWorkingTree().getModelProxyFor(classLocalTypesEntry.definedInKind);
    return definedInModelProxy.view.item.localTypes[type];
  }

  /**
   * Returns the PropertyDefinition corresponding to the Variant member
   * represented by the given Variant member name from the view model
   * corresponding to the attribute corresponding to the associated
   * PropertyDefinition
   *
   * @param variantMemberName
   */
  public getVariantPropertyDefinition(variantMemberName: string):
    PropertyDefinition {
    let propertyDefinition: PropertyDefinition;
    let viewModel: KoheseViewModel =
      (this.getLocalTypeViewModel() as KoheseViewModel);
    let formatDefinitionId: string = viewModel.defaultFormatKey[this.
      _formatDefinitionType];
    if (formatDefinitionId == null) {
      formatDefinitionId = viewModel.defaultFormatKey[FormatDefinitionType.
        DEFAULT];
    }
    let formatDefinition: FormatDefinition = viewModel.formatDefinitions[
      formatDefinitionId];

    formatContainerLoop: for (let j: number = 0; j < formatDefinition.
      containers.length; j++) {
      let formatContainer: FormatContainer = formatDefinition.containers[j];
      if (formatContainer.kind !== FormatContainerKind.
        REVERSE_REFERENCE_TABLE) {
        for (let k: number = 0; k < formatContainer.contents.length; k++) {
          let definition: PropertyDefinition = formatContainer.contents[k];
          if (definition.propertyName === variantMemberName) {
            propertyDefinition = definition;
            break formatContainerLoop;
          }
        }
      }
    }

    if (propertyDefinition == null) {
      /* Use the default FormatDefinition if a PropertyDefinition has not
      already been found */
      formatDefinition = viewModel.formatDefinitions[viewModel.
        defaultFormatKey[FormatDefinitionType.DEFAULT]];
      formatContainerLoop: for (let j: number = 0; j < formatDefinition.
        containers.length; j++) {
        let formatContainer: FormatContainer = formatDefinition.containers[j];
        if (formatContainer.kind !== FormatContainerKind.
          REVERSE_REFERENCE_TABLE) {
          for (let k: number = 0; k < formatContainer.contents.length; k++) {
            let definition: PropertyDefinition = formatContainer.
              contents[k];
            if (definition.propertyName === variantMemberName) {
              propertyDefinition = definition;
              break formatContainerLoop;
            }
          }
        }
      }
    }

    return propertyDefinition;
  }
}
