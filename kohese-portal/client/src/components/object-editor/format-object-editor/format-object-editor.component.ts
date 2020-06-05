import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit,
  Input, Optional, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { FormatDefinition,
  FormatDefinitionType } from '../../type-editor/FormatDefinition.interface';
import { FormatContainer,
  FormatContainerKind } from '../../type-editor/FormatContainer.interface';
import { PropertyDefinition } from '../../type-editor/PropertyDefinition.interface';
import { InputDialogKind } from '../../dialog/input-dialog/input-dialog.component';
import { TreeComponent } from '../../tree/tree.component';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';

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
  
  private _usernames: Array<string> = [];
  get usernames() {
    return this._usernames;
  }
  
  get itemRepository() {
    return this._itemRepository;
  }
  
  get Object() {
    return Object;
  }
  
  get Array() {
    return Array;
  }
  
  get String() {
    return String;
  }
  
  get TreeConfiguration() {
    return TreeConfiguration;
  }
  
  get FormatContainerKind() {
    return FormatContainerKind;
  }

  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef:
    MatDialogRef<FormatObjectEditorComponent>, private _dialogService:
    DialogService, private _itemRepository: ItemRepository) {
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
    
    TreeConfiguration.getWorkingTree().getRootProxy().visitTree({
      includeOrigin: false
    }, (itemProxy: ItemProxy) => {
      if (itemProxy.kind === 'KoheseUser') {
        this._usernames.push(itemProxy.item.name);
      }
    });
    this._usernames.sort();
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
  
  public getTableCellTextRetrievalFunction(attributeName: string): (row: any,
    columnId: string) => string {
    return (row: any, columnId: string) => {
      if (attributeName) {
        if (row[columnId] == null) {
          return '';
        }
        
        let type: any = this._selectedType.classProperties[attributeName].
          definition.type;
        type = (Array.isArray(type) ? type[0] : type);
        let treeConfiguration: TreeConfiguration = this._itemRepository.
          getTreeConfig().getValue().config;
        let dataModel: any;
        let viewModel: any;
        let classLocalTypesEntry: any = (this._enclosingType ? this.
          _enclosingType : this._selectedType).classLocalTypes[type];
        if (classLocalTypesEntry) {
          dataModel = classLocalTypesEntry.definition;
          viewModel = this._itemRepository.getTreeConfig().getValue().config.
            getProxyFor('view-' + classLocalTypesEntry.definedInKind.
            toLowerCase()).item.localTypes[type];
        } else {
          dataModel = treeConfiguration.getProxyFor(type).item;
          viewModel = treeConfiguration.getProxyFor('view-' + type.
            toLowerCase()).item;
        }
        if (Array.isArray(dataModel.classProperties[columnId].definition.type)) {
          return row[columnId].map((value: any, index: number) => {
            // Bullet-ize string representations
            return '\u2022 ' + this._itemRepository.getStringRepresentation(
              row, columnId, index, (this._enclosingType ? this.
              _enclosingType : this._selectedType), dataModel, viewModel, this.
              _formatDefinitionType);
          }).join('\n');
        } else {
          return this._itemRepository.getStringRepresentation(row, columnId,
            undefined, (this._enclosingType ? this._enclosingType : this.
            _selectedType), dataModel, viewModel, this._formatDefinitionType);
        }
      }
      
      return String(row[columnId]);
    };
  }
  
  public isLocalTypeAttribute(attributeName: string): boolean {
    let type: any = (this._enclosingType ? this._enclosingType : this.
      _selectedType);
    let attribute: any = this._selectedType.classProperties[attributeName].
      definition;
    let typeName: string = (Array.isArray(attribute.type) ? attribute.type[
      0] : attribute.type);
    return (type.classLocalTypes && type.classLocalTypes[typeName]);
  }
  
  private getLocalType(attributeName: string): any {
    let attribute: any = this._selectedType.classProperties[attributeName].
      definition;
    let typeName: string = (Array.isArray(attribute.type) ? attribute.type[
      0] : attribute.type);
    let type: any = (this._enclosingType ? this._enclosingType : this.
      _selectedType);
    return type.classLocalTypes[typeName].definition;
  }
  
  public openObjectSelector(attributeName: string): void {
    let itemId = undefined;
    switch (typeof(this._object[attributeName])) {
      case 'object':
        itemId = this._object[attributeName].item.id;
        break;
      case 'string':
        itemId = this._object[attributeName];
    }

    let currentSelectedProxy = TreeConfiguration.getWorkingTree().getProxyFor(itemId);
    let currentSelectedProxyArray = itemId ? [ currentSelectedProxy ] : [];

    this._dialogService.openComponentDialog(TreeComponent, {
      data: {
        root: TreeConfiguration.getWorkingTree().getRootProxy(),
        getChildren: (element: any) => {
          return (element as ItemProxy).children;
        },
        getText: (element: any) => {
          return (element as ItemProxy).item.name;
        },
        maySelect: (element: any) => {
          let typeName: string = this._selectedType.classProperties[
            attributeName].definition.type;
          let elementTypeName: string = (element as ItemProxy).kind;
          if ((elementTypeName === 'Item') || ((attributeName === 'parentId')
            && !this._enclosingType)) {
            if ((attributeName === 'parentId') && !this._enclosingType) {
              let objectItemProxy: ItemProxy = TreeConfiguration.
                getWorkingTree().getProxyFor(this._object.id);
              let itemProxy: ItemProxy = (element as ItemProxy);
              while (itemProxy) {
                if (itemProxy === objectItemProxy) {
                  return false;
                }
                
                itemProxy = itemProxy.parentProxy;
              }
            }
            
            return true;
          /*} else {
            while (true) {
              if (elementTypeName === typeName) {
                return true;
              }
              
              let itemProxy: ItemProxy = TreeConfiguration.getWorkingTree().
                getProxyFor(elementTypeName);
              if (itemProxy) {
                elementTypeName = itemProxy.item.base;
              } else {
                break;
              }
            }*/
          }
          
          return false;
        },
        getIcon: (element: any) => {
          return this._itemRepository.getTreeConfig().getValue().config.
            getProxyFor('view-' + (element as ItemProxy).kind.toLowerCase()).
            item.icon;
        },
        selection: currentSelectedProxyArray,
        quickSelectElements: this._itemRepository.getRecentProxies()
      }
    }).updateSize('90%', '90%').afterClosed().subscribe((selection:
      Array<any>) => {
      if (selection) {
        let itemId = selection[0].item.id;
        if (attributeName === 'parentId') {
          this._object[attributeName] = itemId;
        } else {
          this._object[attributeName] = { id: itemId };
        }
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public addValue(attribute: any): any {
    if (Array.isArray(attribute.type) && this._object[attribute.name] ==
      null) {
      this._object[attribute.name] = [];
    }
    
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
        let isLocalTypeAttribute: boolean = this.isLocalTypeAttribute(
          attribute.name);
        if (isLocalTypeAttribute) {
          let classLocalTypesEntry: any = (this._enclosingType ? this.
            _enclosingType : this._selectedType).classLocalTypes[type];
          let localTypeDataModel: any = classLocalTypesEntry.definition;
          let localTypeViewModel: any = this._itemRepository.getTreeConfig().
            getValue().config.getProxyFor('view-' + classLocalTypesEntry.
            definedInKind.toLowerCase()).item.localTypes[type];
          let localTypeDefaultFormatDefinition: FormatDefinition =
            localTypeViewModel.formatDefinitions[localTypeViewModel.
            defaultFormatKey[FormatDefinitionType.DEFAULT]];
          let localTypeInstance: any = {};
          for (let attributeName in localTypeDataModel.classProperties) {
            let localTypeAttribute: any = localTypeDataModel.classProperties[
              attributeName].definition;
            let localTypeAttributeTypeName: string = (Array.isArray(
              localTypeAttribute.type) ? localTypeAttribute.type[0] :
              localTypeAttribute.type);
            if (!(this._enclosingType ? this._enclosingType : this.
              _selectedType).classLocalTypes[localTypeAttributeTypeName]) {
              localTypeInstance[attributeName] = localTypeAttribute.default;
              if (localTypeInstance[attributeName] == null) {
                if (Array.isArray(localTypeAttribute.type)) {
                  localTypeInstance[attributeName] = [];
                } else {
                  // 'state-editor' by the attribute's default value
                  switch (localTypeAttributeTypeName) {
                    case 'boolean':
                      localTypeInstance[attributeName] = false;
                    case 'number':
                      localTypeInstance[attributeName] = 0;
                    case 'timestamp':
                      localTypeInstance[attributeName] = new Date().getTime();
                    case 'string':
                      if (localTypeAttribute.relation) {
                        // 'username' attribute reference
                        localTypeAttribute[attributeName] = 'admin';
                      } else {
                        localTypeAttribute[attributeName] = '';
                      }
                      break;
                    default:
                      if (!localTypeAttribute.relation.contained) {
                        localTypeAttribute[attributeName] = {
                          id: ''
                        };
                      }
                  }
                }
              }
            }
          }
          
          return localTypeInstance;
        } else {
          return {
            id: ''
          };
        }
    }
  }
  
  public getTableElements(attributeDefinition: PropertyDefinition):
    Array<any> {
    let value: Array<any> = this._object[attributeDefinition.propertyName];
    if (value) {
      return value.map((reference: { id: string }) => {
        return TreeConfiguration.getWorkingTree().getProxyFor(reference.id).
          item;
      });
    }
    
    return [];
  }
  
  public getTableColumns(attributeDefinition: PropertyDefinition):
    Array<string> {
    return TreeConfiguration.getWorkingTree().getProxyFor('view-' + this.
      _selectedType.classProperties[attributeDefinition.propertyName].
      definition.type[0].toLowerCase()).item.tableDefinitions[
      attributeDefinition.tableDefinition].columns;
  }
  
  public getTableElementAdditionFunction(attributeDefinition:
    PropertyDefinition): () => Promise<Array<any>> {
    return async () => {
      let references: Array<{ id: string }> = this._object[attributeDefinition.
        propertyName];
      if (!references) {
        references = this._object[attributeDefinition.propertyName] = [];
      }
      let selection: any = await this._dialogService.openComponentDialog(
        TreeComponent, {
        data: {
          root: TreeConfiguration.getWorkingTree().getRootProxy(),
          getChildren: (element: any) => {
            return (element as ItemProxy).children;
          },
          getText: (element: any) => {
            return (element as ItemProxy).item.name;
          },
          maySelect: (element: any) => {
            let typeName: string = this._selectedType.classProperties[
              attributeDefinition.propertyName].definition.type[0];
            let elementTypeName: string = (element as ItemProxy).kind;
            if (elementTypeName === 'Item') {
              return true;
            } else {
              while (true) {
                if (elementTypeName === typeName) {
                  return true;
                }
                
                let itemProxy: ItemProxy = TreeConfiguration.
                  getWorkingTree().getProxyFor(elementTypeName);
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
            return this._itemRepository.getTreeConfig().getValue().config.
              getProxyFor('view-' + (element as ItemProxy).kind.toLowerCase()).
              item.icon;
          },
          selection: references.map((reference: { id: string }) => {
            return TreeConfiguration.getWorkingTree().getProxyFor(reference.
              id);
          }),
          quickSelectElements: this._itemRepository.getRecentProxies(),
          allowMultiselect: true,
          showSelections: true
        }
      }).updateSize('90%', '90%').afterClosed().toPromise();
      
      let rows: Array<any> = [];
      if (selection) {
        references.length = 0;
        references.push(...selection.map((itemProxy: ItemProxy) => {
          return { id: itemProxy.item.id };
        }));
      }

      rows.push(...references.map((reference: { id: string }) => {
        return TreeConfiguration.getWorkingTree().getProxyFor(reference.id).
          item;
      }));
      
      // Delete the array if it becomes empty
      if (references.length === 0) {
        delete this._object[attributeDefinition.propertyName];
      }
      
      this._changeDetectorRef.markForCheck();
      return rows;
    };
  }
  
  public getTableElementMovementFunction(attributeDefinition:
    PropertyDefinition): (elements: Array<any>, referenceElement: any,
    moveBefore: boolean) => void {
    return (elements: Array<any>, referenceElement: any,
      moveBefore: boolean) => {
      let references: Array<{ id: string }> = this._object[attributeDefinition.
        propertyName];
      for (let j: number = 0; j < elements.length; j++) {
        references.splice(references.map((reference: { id: string }) => {
          return TreeConfiguration.getWorkingTree().getProxyFor(reference.id).
            item;
        }).indexOf(elements[j]), 1);
      }
      
      if (moveBefore) {
        references.splice(references.map((reference: { id: string }) => {
          return TreeConfiguration.getWorkingTree().getProxyFor(reference.id).
            item;
        }).indexOf(referenceElement), 0, ...elements.map((item: any) => {
          return { id: item.id };
        }));
      } else {
        references.splice(references.map((reference: { id: string }) => {
          return TreeConfiguration.getWorkingTree().getProxyFor(reference.id).
            item;
        }).indexOf(referenceElement) + 1, 0, ...elements.map((item: any) => {
          return { id: item.id };
        }));
      }
      
      this._changeDetectorRef.markForCheck();
    };
  }
  
  public getTableElementRemovalFunction(attributeDefinition:
    PropertyDefinition): (elements: Array<any>) => void {
    return (elements: Array<any>) => {
      for (let j: number = 0; j < elements.length; j++) {
        this._object[attributeDefinition.propertyName].splice(this._object[
          attributeDefinition.propertyName].map((reference: { id:
          string }) => {
            return TreeConfiguration.getWorkingTree().getProxyFor(reference.
              id).item;
        }).indexOf(elements[j]), 1);
      }
      
      this._changeDetectorRef.markForCheck();
    };
  }
  
  public getAttributeRepresentation(attributeDefinition: PropertyDefinition):
    string {
    // Only customLabel should be used in the first part of the statement below
    return ((attributeDefinition.customLabel ? attributeDefinition.
      customLabel : attributeDefinition.propertyName) + (this._selectedType.
      classProperties[attributeDefinition.propertyName].definition.required ?
      '*' : ''));
  }
  
  public getDateString(timestamp: number): string {
    if (timestamp == null) {
      return undefined;
    }
    
    return new Date(timestamp).toISOString();
  }
  
  public getStateTransitionCandidates(attributeDefinition: PropertyDefinition):
    Array<string> {
    let stateTransitionCandidates: Array<string> = [];
    let currentStateName: string = this._object[attributeDefinition.
      propertyName];
    let stateMachine: any = this._selectedType.classProperties[
      attributeDefinition.propertyName].definition.properties;
    for (let transitionName in stateMachine.transition) {
      if (stateMachine.transition[transitionName].source ===
        currentStateName) {
        stateTransitionCandidates.push(transitionName);
      }
    }
    
    return stateTransitionCandidates;
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
