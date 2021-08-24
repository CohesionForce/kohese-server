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
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input,
  OnInit, Optional, QueryList, ViewChildren } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

// Other External Dependencies

// Kohese
import { FormatContainer, FormatContainerKind } from '../../../../../common/src/FormatContainer.interface';
import { FormatDefinition, FormatDefinitionType } from '../../../../../common/src/FormatDefinition.interface';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { KoheseModel } from '../../../../../common/src/KoheseModel';
import { PropertyDefinition } from '../../../../../common/src/PropertyDefinition.interface';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { Field } from './field/field.class';
import { MultivaluedFieldComponent } from './field/multivalued-field/multivalued-field.component';
import { SinglevaluedFieldComponent } from './field/singlevalued-field/singlevalued-field.component';

@Component({
  selector: 'format-object-editor',
  templateUrl: './format-object-editor.component.html',
  styleUrls: ['./format-object-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormatObjectEditorComponent implements OnInit {
  private _object: any;
  get object() {
    return this._object;
  }
  @Input('object')
  set object(object: any) {
    if (!object) {
      object = {};
    }

    this._object = object;
  }

  private _enclosingType: any;
  get enclosingType() {
    return this._enclosingType;
  }
  @Input('enclosingType')
  set enclosingType(enclosingType: any) {
    this._enclosingType = enclosingType;
  }

  private _formatDefinitionType: FormatDefinitionType;
  get formatDefinitionType() {
    return this._formatDefinitionType;
  }
  @Input('formatDefinitionType')
  set formatDefinitionType(formatDefinitionType: FormatDefinitionType) {
    this._formatDefinitionType = formatDefinitionType;
    this._changeDetectorRef.markForCheck();
  }

  private _selectedNamespace: any;
  get selectedNamespace() {
    return this._selectedNamespace;
  }
  set selectedNamespace(selectedNamespace: any) {
    this._selectedNamespace = selectedNamespace;
    this.selectedType = this.getNamespaceTypes(this._selectedNamespace)[0];
  }

  private _selectedType: any;
  get selectedType() {
    return this._selectedType;
  }
  set selectedType(selectedType: any) {
    this._selectedType = selectedType;

    if (this._enclosingType) {
      // there is a local data model
      let definedInKind = this._enclosingType.classLocalTypes[this._selectedType.name].definedInKind;
      // returns the model for the object's kind
      let modelProxy = TreeConfiguration.getWorkingTree().getModelProxyFor(definedInKind);
      // returns the viewModel for the object's local type
      this._viewModel = modelProxy.view.item.localTypes[this._selectedType.name];
    } else {
      // there is an enclosingDataModel with a top-level "kind"
      let selectedTypeModelProxy : KoheseModel = TreeConfiguration.getWorkingTree().getModelProxyFor(this._selectedType.name);
      this._viewModel = selectedTypeModelProxy.view.item;
    }

    // returns the object's format definition from the view-model's format definition
    this._formatDefinition = this._viewModel.formatDefinitions[this._viewModel.defaultFormatKey[this._formatDefinitionType]];
    if (!this._formatDefinition) {
      // returns the default definition if there is none specified in the view model
      this._formatDefinition = this._viewModel.formatDefinitions[this._viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]];
    }

    // returns the name of the format definition as a string
    this._formatDefinition = JSON.parse(JSON.stringify(this._formatDefinition));
    // loads the kind and contents (called the propertyDefinition) to the beginning of the format definition container array
    this._formatDefinition.containers.unshift({
      kind: FormatContainerKind.VERTICAL,
      contents: [...this._formatDefinition.header.contents]
    });
    // Adjust PropertyDefinitions for references that are typed 'string'
    for (let j: number = 0; j < this._formatDefinition.containers.length; j++) {
      let formatContainer: FormatContainer = this._formatDefinition.containers[j];
      for (let k: number = 0; k < formatContainer.contents.length; k++) {
        let propertyDefinition: PropertyDefinition = formatContainer.contents[k];
        if ((propertyDefinition.kind === 'string') || (propertyDefinition.kind === 'text')) {
          // handles inheritence
          // i.e. if a task is subclassed, its properties will always be contained within classProperties
          let attribute: any = this._selectedType.classProperties[propertyDefinition.propertyName].definition;
          if (attribute.relation && (attribute.relation.foreignKey === 'username')) {
            // transforms the kind to user-selector if it has a foreignKey of username
            propertyDefinition.kind = 'user-selector';
          }
        }
      }
    }

    for (let attributeName in this._selectedType.classProperties) {
      if (this._object[attributeName] == null) {
        let defaultValue: any = this._selectedType.classProperties[
          attributeName].definition.default;
        if (defaultValue != null) {
          this._object[attributeName] = defaultValue;
        }
      }
    }
  }

  private _isDisabled: boolean = false;
  get isDisabled() {
    return this._isDisabled;
  }
  @Input('disabled')
  set isDisabled(isDisabled: boolean) {
    this._isDisabled = isDisabled;
  }

  private _allowKindChange: boolean = false;
  get allowKindChange() {
    return this._allowKindChange;
  }
  @Input('allowKindChange')
  set allowKindChange(allowKindChange: boolean) {
    this._allowKindChange = allowKindChange;
  }

  private _allowKindNarrowingOnly: boolean = true;
  get allowKindNarrowingOnly() {
    return this._allowKindNarrowingOnly;
  }
  @Input('allowKindNarrowingOnly')
  set allowKindNarrowingOnly(allowKindNarrowingOnly: boolean) {
    this._allowKindNarrowingOnly = allowKindNarrowingOnly;
  }

  private _type: any;
  get type() {
    return this._type;
  }
  @Input('type')
  set type(type: any) {
    this._type = type;
    if (this._allowKindChange && !this._enclosingType) {
      this._selectedNamespace = TreeConfiguration.getWorkingTree().getProxyFor(this._type.namespace.id).item;
    }
    this.selectedType = this._type;
  }

  private _viewModel: any;
  get viewModel() {
    return this._viewModel;
  }

  private _formatDefinition: FormatDefinition;
  get formatDefinition() {
    return this._formatDefinition;
  }

  get itemRepository() {
    return this._itemRepository;
  }

  @ViewChildren(SinglevaluedFieldComponent)
  private _singlevaluedFieldComponentQueryList:
    QueryList<SinglevaluedFieldComponent>;

  @ViewChildren(MultivaluedFieldComponent)
  private _multivaluedFieldComponentQueryList:
    QueryList<MultivaluedFieldComponent>;

  get Array() {
    return Array;
  }

  get FormatContainerKind() {
    return FormatContainerKind;
  }

  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef:
    MatDialogRef<FormatObjectEditorComponent>, private _itemRepository:
    ItemRepository) {
  }

  public ngOnInit(): void {
    if (this.isDialogInstance()) {
      this.object = this._data['object'];
      this.enclosingType = this._data['enclosingType'];
      this.formatDefinitionType = this._data['formatDefinitionType'];
      this.isDisabled = this._data['disabled'];
      this.allowKindChange = this._data['allowKindChange'];
      if (this._data['allowKindNarrowingOnly']) {
        this.allowKindNarrowingOnly = this._data['allowKindNarrowingOnly'];
      }
      this.type = this._data['type'];
    }
  }

  public isDialogInstance(): boolean {
    return this._matDialogRef && (this._matDialogRef.componentInstance ===
      this) && this._data;
  }

  /**
   * Returns an Array containing all Namespaces that contain at least one type
   */
  public getNamespaces(): Array<any> {
    let namespaces: Array<any> = [];
    TreeConfiguration.getWorkingTree().getProxyFor(
      'Model-Definitions').visitTree({ includeOrigin: false }, (itemProxy:
      ItemProxy) => {
      if ((itemProxy.kind === 'Namespace') && (this.getNamespaceTypes(itemProxy.item).length > 0)) {
        namespaces.push(itemProxy.item);
      }
    }, undefined);

    namespaces.sort((oneNamespace: any, anotherNamespace: any) => {
      return oneNamespace.name.localeCompare(anotherNamespace.name);
    });

    return namespaces;
  }

  /**
   * Returns an Array containing all types in the given Namespace
   *
   * @param namespace
   */
  public getNamespaceTypes(namespace: any): Array<any> {
    let types: Array<any> = [];
    TreeConfiguration.getWorkingTree().getProxyFor('Model-Definitions').visitTree(
      { includeOrigin: false }, (itemProxy: ItemProxy) => {
      if ((itemProxy.kind === 'KoheseModel') && (itemProxy.item.restrictInstanceEditing !== true)
                                             && (itemProxy.item.namespace.id === namespace.id)) {
        if (this._allowKindNarrowingOnly) {
          let modelItemProxy: any = itemProxy;
          while (modelItemProxy) {
            if (modelItemProxy.item === this._type) {
              types.push(itemProxy.item);
              break;
            }

            modelItemProxy = TreeConfiguration.getWorkingTree().getProxyFor(modelItemProxy.item.base);
          }
        } else {
          types.push(itemProxy.item);
        }
      }
    }, undefined);

    types.sort((oneType: any, anotherType: any) => {
      return oneType.name.localeCompare(anotherType.name);
    });

    return types;
  }

  public getReverseReferenceTableHeaderContent(formatContainer: FormatContainer): string {
    return formatContainer.contents.map((propertyDefinition: PropertyDefinition) => {
      // e.g. "issue's resolutionAction"
      return propertyDefinition.propertyName.kind + '\'s ' + propertyDefinition.propertyName.attribute;
    }).join(', ');
  }

  public getReverseReferences(formatContainer: FormatContainer): Array<any> {
    let references: Array<any> = [];
    // FOE works on the items, not their proxies. Retrieval of the proxy is necessary to get reverse references
    let itemProxyBeingReferenced: any = TreeConfiguration.getWorkingTree().getProxyFor(this._object.id);
    // itemRelations contains the observation type (ie issue/observation) and its contextual proxies
    let itemRelations: any = itemProxyBeingReferenced.relations.referencedBy;
    for (let j: number = 0; j < formatContainer.contents.length; j++) {
      let propertyDefinition: PropertyDefinition = formatContainer.contents[j];
      if (itemRelations[propertyDefinition.propertyName.kind] &&
          itemRelations[propertyDefinition.propertyName.kind][propertyDefinition.propertyName.attribute]) {
        // propertyDefinition.propertyName.attribute equates to "analysisAction" or something similar like "requiresAction"
        references.push(...itemRelations[propertyDefinition.propertyName.kind][propertyDefinition.propertyName.attribute].map(
          (itemProxy: ItemProxy) => {
          // execution:   Returns the items contained in itemRelations.relations.referencedBy
          // explanation: Since we are pushing to the references array from itemRelations,
          //              we still have the items associated with its "context". These items are found by
          //              specifying the index into the double array (kind | attribute) for the propertyName.
          return itemProxy.item;
        }));
      }
    }


    return references;
  }

  /**
   * Returns a function intended to be called by TableComponent to retrieve
   * text for the table cell indicated by the given row and column identifier
   */
  public getTableCellTextRetrievalFunction(): (row: any, columnId: string) =>
    string {
    return (row: any, columnId: string) => {
      return String(row[columnId]);
    };
  }

  /**
   * Returns the Field (either a SinglevaluedFieldComponent instance or a
   * MultivaluedFieldComponent instance) corresponding to the attribute name.
   * The given ```boolean``` should indicate whether the corresponding
   * attribute is single-valued or multi-valued.
   *
   * @param attributeName
   * @param isMultivalued
   */
  public getField(attributeName: string, isMultivalued: boolean): Field {
    if (isMultivalued) {
      return this._multivaluedFieldComponentQueryList.toArray().find(
        (multivaluedFieldComponent: MultivaluedFieldComponent) => {
        return (multivaluedFieldComponent.propertyDefinition.propertyName === attributeName);
      });
    } else {
      return this._singlevaluedFieldComponentQueryList.toArray().find(
        (singlevaluedFieldComponent: SinglevaluedFieldComponent) => {
        return (singlevaluedFieldComponent.propertyDefinition.propertyName === attributeName);
      });
    }
  }

  public isObjectValid(): boolean {
    for (let attributeName in this._selectedType.classProperties) {
      let attributeValue: any = this._object[attributeName];
      if (this._selectedType.classProperties[attributeName].definition.required
        && ((Array.isArray(attributeValue) && !attributeValue.length) ||
            (attributeValue === undefined) ||
            (attributeValue == null) ||
            (attributeValue === ''))) {
        return false;
      }
    }

    return true;
  }

  public close(accept: boolean): any {
    let result: any = {
      type: this._selectedType,
      object: this._object
    };

    if (this.isDialogInstance()) {
      this._matDialogRef.close(accept ? result : undefined);
    }

    return result;
  }
}
