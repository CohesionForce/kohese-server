import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input,
  OnInit, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { FormatContainer, FormatContainerKind } from '../../../../../common/src/FormatContainer.interface';
import { FormatDefinition, FormatDefinitionType } from '../../../../../common/src/FormatDefinition.interface';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { PropertyDefinition } from '../../../../../common/src/PropertyDefinition.interface';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';

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
  
  private _types: Array<any> = [];
  get types() {
    return this._types;
  }
  
  private _selectedType: any;
  get selectedType() {
    return this._selectedType;
  }
  set selectedType(selectedType: any) {
    this._selectedType = selectedType;
    
    if (this._enclosingType) {
      this._viewModel = TreeConfiguration.getWorkingTree().getProxyFor(
        'view-' + this._enclosingType.classLocalTypes[this._selectedType.name].
        definedInKind.toLowerCase()).item.localTypes[this._selectedType.name];
    } else {
      this._viewModel = TreeConfiguration.getWorkingTree().getProxyFor('view-' +
        this._selectedType.name.toLowerCase()).item;
    }
    
    this._formatDefinition = this._viewModel.formatDefinitions[this._viewModel.
      defaultFormatKey[this._formatDefinitionType]];
    if (!this._formatDefinition) {
      this._formatDefinition = this._viewModel.formatDefinitions[this.
        _viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]];
    }
    
    this._formatDefinition = JSON.parse(JSON.stringify(this.
      _formatDefinition));
    this._formatDefinition.containers.unshift({
      kind: FormatContainerKind.VERTICAL,
      contents: [...this._formatDefinition.header.contents]
    });
    // Adjust PropertyDefinitions for references that are typed 'string'
    for (let j: number = 0; j < this._formatDefinition.containers.length;
      j++) {
      let formatContainer: FormatContainer = this._formatDefinition.containers[
        j];
      for (let k: number = 0; k < formatContainer.contents.length; k++) {
        let propertyDefinition: PropertyDefinition = formatContainer.contents[
          k];
        if ((propertyDefinition.kind === 'string') || (propertyDefinition.kind
          === 'text')) {
          let attribute: any = this._selectedType.classProperties[
            propertyDefinition.propertyName].definition;
          if (attribute.relation && (attribute.relation.foreignKey ===
            'username')) {
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
    this.selectedType = this._type;
    
    this._types.length = 0;
    if (this._allowKindChange) {
      this._itemRepository.getTreeConfig().getValue().config.getRootProxy().
        visitTree({ includeOrigin: false }, (itemProxy: ItemProxy) => {
        if (itemProxy.kind === 'KoheseModel') {
          if (this._allowKindNarrowingOnly) {
            let modelItemProxy: any = itemProxy;
            while (modelItemProxy) {
              if (modelItemProxy.item === this._type) {
                this._types.push(itemProxy.item);
                break;
              }
              
              modelItemProxy = this._itemRepository.getTreeConfig().getValue().
                config.getProxyFor(modelItemProxy.item.base);
            }
          } else {
            this._types.push(itemProxy.item);
          }
        }
      }, undefined);
    
      this._types.sort((oneType: any, anotherType: any) => {
        return oneType.name.localeCompare(anotherType.name);
      });
    }
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
  
  public getReverseReferenceTableHeaderContent(formatContainer:
    FormatContainer): string {
    return formatContainer.contents.map((propertyDefinition:
      PropertyDefinition) => {
      return propertyDefinition.propertyName.kind + '\'s ' +
        propertyDefinition.propertyName.attribute;
    }).join(', ');
  }
  
  public getReverseReferences(formatContainer: FormatContainer): Array<any> {
    let references: Array<any> = [];
    let reverseReferencesObject: any = TreeConfiguration.getWorkingTree().
      getProxyFor(this._object.id).relations.referencedBy;
    for (let j: number = 0; j < formatContainer.contents.length; j++) {
      let propertyDefinition: PropertyDefinition = formatContainer.contents[j];
      if (reverseReferencesObject[propertyDefinition.propertyName.kind]) {
        references.push(...reverseReferencesObject[propertyDefinition.
          propertyName.kind][propertyDefinition.propertyName.attribute].map(
          (itemProxy: ItemProxy) => {
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
  
  public isObjectValid(): boolean {
    for (let attributeName in this._selectedType.classProperties) {
      let attributeValue: any = this._object[attributeName];
      if (this._selectedType.classProperties[attributeName].definition.required
        && ((attributeValue == null) || (attributeValue === ''))) {
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
