import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit,
  Input, Optional, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { DialogService,
  DialogComponent } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { FormatDefinition,
  FormatDefinitionType } from '../../type-editor/FormatDefinition.interface';
import { FormatContainer,
  FormatContainerKind } from '../../type-editor/FormatContainer.interface';
import { PropertyDefinition } from '../../type-editor/PropertyDefinition.interface';
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
      TreeConfiguration.getWorkingTree().getRootProxy().visitTree(
        { includeOrigin: false }, (itemProxy: ItemProxy) => {
        if (itemProxy.kind === 'KoheseModel') {
          let modelItemProxy: any = itemProxy;
          while (modelItemProxy) {
            if (modelItemProxy.item === this._type) {
              this._types.push(itemProxy.item);
              break;
            }
            
            modelItemProxy = TreeConfiguration.getWorkingTree().getProxyFor(
              modelItemProxy.item.base);
          }
        }
      }, undefined);
    
      this._types.sort((oneType: any, anotherType: any) => {
        return oneType.name.localeCompare(anotherType.name);
      });
    }
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
        'view-' + this._enclosingType.name.toLowerCase()).item.localTypes[this.
        _selectedType.name];
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
      if ((this._object[attributeName] == null) || (this._object[attributeName]
        === '')) {
        let defaultValue: any = this._selectedType.classProperties[
          attributeName].definition.default;
        if ((defaultValue != null) && (defaultValue !== '')) {
          this._object[attributeName] = defaultValue;
        } else if (this._object[attributeName] == null) {
          if (Array.isArray(this._selectedType.classProperties[attributeName].
            definition.type)) {
            this._object[attributeName] = [];
          } else {
            this._object[attributeName] = null;
          }
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
      this._type = this._data['type'];
      this._object = this._data['object'];
      this._enclosingType = this._data['enclosingType'];
      this._formatDefinitionType = this._data['formatDefinitionType'];
      this._isDisabled = this._data['disabled'];
      this._allowKindChange = this._data['allowKindChange'];
    }
    
    if (!this._object) {
      this._object = {};
    }
    
    this.type = this._type;
    
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
  
  public getReverseReferenceName(element: any): string {
    return element.name;
  }
  
  public isLocalTypeAttribute(attributeName: string): boolean {
    let attribute: any = this._selectedType.classProperties[attributeName].
      definition;
    let typeName: string = (Array.isArray(attribute.type) ? attribute.type[
      0] : attribute.type);
    return this._selectedType.localTypes[typeName];
  }
  
  public getLocalType(propertyDefinition: PropertyDefinition): any {
    let attribute: any = this._selectedType.classProperties[propertyDefinition.
      propertyName].definition;
    let typeName: string = (Array.isArray(attribute.type) ? attribute.type[
      0] : attribute.type);
    let localTypeCopy: any = JSON.parse(JSON.stringify(this._selectedType.
      localTypes[typeName]));
    localTypeCopy.classProperties = {};
    for (let attributeName in localTypeCopy.properties) {
      localTypeCopy.classProperties[attributeName] = {
        definedInKind: typeName,
        definition: localTypeCopy.properties[attributeName]
      };
    }
    
    return localTypeCopy;
  }
  
  public getLocalTypeViewModel(propertyDefinition: PropertyDefinition): any {
    let attribute: any = this._selectedType.classProperties[propertyDefinition.
      propertyName].definition;
    let typeName: string = (Array.isArray(attribute.type) ? attribute.type[
      0] : attribute.type);
    return this._viewModel.localTypes[typeName];
  }
  
  public getLocalTypeAttributes(propertyDefinition: PropertyDefinition):
    Array<any> {
    let attributes: Array<any> = [];
    let localType: any = this.getLocalType(propertyDefinition);
    for (let attributeName in localType.properties) {
      attributes.push(localType.properties[attributeName]);
    }
    
    return attributes;
  }
  
  public getLocalTypeFormatDefinition(propertyDefinition: PropertyDefinition):
    FormatDefinition {
    return this.getLocalTypeViewModel(propertyDefinition).formatDefinitions[
      propertyDefinition.formatDefinition];
  }
  
  public openObjectEditor(attributeName: string): void {
    let value: any = this._object[attributeName];
    this._dialogService.openComponentDialog(FormatObjectEditorComponent, {
      data: {
        object: (value ? TreeConfiguration.getWorkingTree().getProxyFor(value.
          id).item : value),
        type: this.getType(attributeName)
      }
    }).updateSize('80%', '80%').afterClosed().subscribe((result: any) => {
      if (result.object) {
        this._itemRepository.upsertItem(result.type.name, result.object);
      }
    });
  }
  
  public openObjectSelector(attributeName: string): void {
    this._dialogService.openComponentDialog(TreeComponent, {
      data: {
        root: TreeConfiguration.getWorkingTree().getRootProxy(),
        getChildren: (element: any) => {
          return (element as ItemProxy).children;
        },
        getText: (element: any) => {
          return (element as ItemProxy).item.name;
        },
        selection: (this._object[attributeName] ? [TreeConfiguration.
          getWorkingTree().getProxyFor(this._object[attributeName].id)] : []),
        quickSelectElements: this._itemRepository.getRecentProxies()
      }
    }).updateSize('90%', '90%').afterClosed().subscribe((selection:
      Array<any>) => {
      if (selection) {
        this._object[attributeName] = { id: selection[0].item.id };
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public addValue(attributeDefinition: PropertyDefinition): void {
    this.editValue(this._object[attributeDefinition.propertyName].length,
      attributeDefinition);
  }
  
  public editValue(index: number, attributeDefinition: PropertyDefinition):
    void {
    let attributeName: string = attributeDefinition.propertyName;
    const DIALOG_TITLE: string = 'Specify Value';
    let value: any = this._object[attributeName][index];
    switch (this.getTypeName(this._selectedType.classProperties[
      attributeDefinition.propertyName].definition.type)) {
      case 'boolean':
        if (value == null) {
          value = false;
        }
        this._dialogService.openSelectDialog(DIALOG_TITLE, '',
          attributeName, value, [true, false]).afterClosed().subscribe(
          (value: boolean) => {
          if (value != null) {
            this._object[attributeName].splice(index, 1, value);
            this._changeDetectorRef.markForCheck();
          }
        });
        break;
      case 'number':
        if (value == null) {
          value = 0;
        }
        
        this._dialogService.openInputDialog(DIALOG_TITLE, '', DialogComponent.
          INPUT_TYPES.NUMBER, attributeName, value, undefined).afterClosed().
          subscribe((value: number) => {
          if (value != null) {
            this._object[attributeName].splice(index, 1, value);
            this._changeDetectorRef.markForCheck();
          }
        });
        break;
      case 'date':
        if (value == null) {
          value = new Date().getTime();
        }
        
        this._dialogService.openInputDialog(DIALOG_TITLE, '', DialogComponent.
          INPUT_TYPES.DATE, attributeName, value, undefined).afterClosed().
          subscribe((value: number) => {
          if (value != null) {
            this._object[attributeName].splice(index, 1, value);
            this._changeDetectorRef.markForCheck();
          }
        });
        break;
      case 'string':
        if (value == null) {
          value = '';
        }
        
        this._dialogService.openInputDialog(DIALOG_TITLE, '', DialogComponent.
          INPUT_TYPES.TEXT, attributeName, value, undefined).afterClosed().
          subscribe((value: string) => {
          if (value) {
            this._object[attributeName].splice(index, 1, value);
            this._changeDetectorRef.markForCheck();
          }
        });
        break;
      case 'markdown':
        if (value == null) {
          value = '';
        }
        
        this._dialogService.openInputDialog(DIALOG_TITLE, '', DialogComponent.
          INPUT_TYPES.MARKDOWN, attributeName, value, undefined).afterClosed().
          subscribe((value: string) => {
          if (value) {
            this._object[attributeName].splice(index, 1, value);
            this._changeDetectorRef.markForCheck();
          }
        });
        break;
      case 'state-editor':
        this._dialogService.openSelectDialog(DIALOG_TITLE, attributeName +
          ': ' + this._object[attributeName], 'Target', value, this.
          getStateTransitionCandidates(attributeDefinition).map(
          (transitionCandidateName: string) => {
          return this._selectedType.classProperties[attributeName].definition.
            properties.transition[transitionCandidateName].target;
        })).afterClosed().subscribe((value: string) => {
          if (value) {
            this._object[attributeName].splice(index, 1, value);
            this._changeDetectorRef.markForCheck();
          }
        });
        break;
      case 'user-selector':
        if (value == null) {
          value = 'admin';
        }
        
        this._dialogService.openSelectDialog(DIALOG_TITLE, '',
          attributeName, value, this._usernames).afterClosed().subscribe(
          (value: string) => {
          if (value != null) {
            this._object[attributeName].splice(index, 1, value);
            this._changeDetectorRef.markForCheck();
          }
        });
        break;
      default:
        let type: any = this.getType(attributeName);
        if (!this._enclosingType) {
          this._dialogService.openComponentDialog(TreeComponent, {
            data: {
              root: TreeConfiguration.getWorkingTree().getRootProxy(),
              getChildren: (element: any) => {
                return (element as ItemProxy).children;
              },
              getText: (element: any) => {
                return (element as ItemProxy).item.name;
              },
              allowMultiselect: true,
              showSelections: true,
              selection: (this._object[attributeName] ? this._object[
                attributeName].map((reference: any) => {
                return TreeConfiguration.getWorkingTree().getProxyFor(
                  reference.id);
              }) : []),
              quickSelectElements: this._itemRepository.getRecentProxies()
            }
          }).updateSize('90%', '90%').afterClosed().subscribe((selection:
            Array<any>) => {
            if (selection) {
              this._object[attributeName].length = 0;
              this._object[attributeName].push(...selection.map((element:
                any) => {
                return { id: (element as ItemProxy).item.id };
              }));
              
              this._changeDetectorRef.markForCheck();
            }
          });
        } else {
          this._dialogService.openComponentDialog(FormatObjectEditorComponent, {
            data: {
              object: ((!value || this._enclosingType) ? value :
                TreeConfiguration.getWorkingTree().getProxyFor(value.id).item),
              type: type
            }
          }).updateSize('80%', '80%').afterClosed().subscribe((result:
            any) => {
            if (result.object) {
              if (this._enclosingType) {
                this._object[attributeName].splice(index, 1, result.object);
                this._changeDetectorRef.markForCheck();
              } else {
                this._itemRepository.upsertItem(result.type.name, result.
                  object);
              }
            }
          });
        }
    }
  }
  
  public removeValue(index: number, attributeName: string): void {
    this._object[attributeName].splice(index, 1);
    this._changeDetectorRef.markForCheck();
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
  
  public getTableElementName(element: any): string {
    return element.name;
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
    return ((attributeDefinition.customLabel ? attributeDefinition.
      customLabel : attributeDefinition.propertyName) +
      (this._selectedType.classProperties[attributeDefinition.propertyName].
      definition.required ? '*' : ''));
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
  
  public getStringRepresentation(index: number, attributeName: string):
    string {
    let value: any;
    if (index != null) {
      value = this._object[attributeName][index];
    } else {
      value = this._object[attributeName];
    }
    
    let representation: string = String(value);
    if (representation === String({})) {
      if (value.name) {
        representation = value.name;
      } else if (value.id) {
        let itemProxy: ItemProxy = TreeConfiguration.getWorkingTree().
          getProxyFor(value.id);
        if (itemProxy) {
          // References
          representation = itemProxy.item.name;
        } else {
          representation = value.id;
        }
      } else {
        representation = value[Object.keys(value)[0]];
      }
    }
    
    return representation;
  }
  
  private getTypeName(typeValue: any): string {
    let type: string;
    if (Array.isArray(typeValue)) {
      type = typeValue[0];
    } else {
      type = typeValue;
    }
    
    return type;
  }
  
  private getType(attributeName: string): any {
    let typeName: string = this.getTypeName(this._selectedType.classProperties[
      attributeName].definition.type);
    for (let localTypeName in this._selectedType.localTypes) {
      if (localTypeName === typeName) {
        return this._selectedType.localTypes[localTypeName];
      }
    }
    
    return TreeConfiguration.getWorkingTree().getProxyFor(typeName).item;
  }
}
