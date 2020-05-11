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
	      let type: any = this._selectedType.classProperties[attributeName].
	        definition.type;
	      type = (Array.isArray(type) ? type[0] : type);
	      let treeConfiguration: TreeConfiguration = this._itemRepository.
	        getTreeConfig().getValue().config;
	      let dataModel: any = this._selectedType.localTypes[type];
	      let viewModel: any;
	      if (dataModel) {
	        viewModel = this._viewModel.localTypes[type];
	      } else {
	        dataModel = treeConfiguration.getProxyFor(type).item;
	        viewModel = treeConfiguration.getProxyFor('view-' + type.
	          toLowerCase()).item;
	      }
	      if (Array.isArray(dataModel.classProperties[columnId].definition.type)) {
          let attributeValue = row[columnId] || [];
	        return attributeValue.map((value: any, index: number) => {
	          // Bullet-ize string representations
	          return '\u2022 ' + this.getStringRepresentation(row, columnId,
	            index, dataModel, viewModel);
	        }).join('\n');
	      } else {
	        return this.getStringRepresentation(row, columnId, undefined,
	          dataModel, viewModel);
	      }
	    }
	    
      return String(row[columnId]);
    };
  }
  
  public isLocalTypeAttribute(attributeName: string): boolean {
    let attribute: any = this._selectedType.classProperties[attributeName].
      definition;
    let typeName: string = (Array.isArray(attribute.type) ? attribute.type[
      0] : attribute.type);
    return (this._selectedType.localTypes && this._selectedType.localTypes[
      typeName]);
  }
  
  private getLocalType(attributeName: string): any {
    let attribute: any = this._selectedType.classProperties[attributeName].
      definition;
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
  
  public openObjectEditor(propertyDefinition: PropertyDefinition,
    useExistingValue: boolean): void {
    let value: any = this._object[propertyDefinition.propertyName];
    let isLocalTypeAttribute: boolean = this.isLocalTypeAttribute(
      propertyDefinition.propertyName);
    this._dialogService.openComponentDialog(FormatObjectEditorComponent, {
      data: {
        object: (useExistingValue ? (isLocalTypeAttribute ? value : (value ?
          this._itemRepository.getTreeConfig().getValue().config.getProxyFor(
          value.id).item : value)) : undefined),
        enclosingType: (isLocalTypeAttribute ? this._selectedType : undefined),
        formatDefinitionType: this._formatDefinitionType,
        disabled: (!propertyDefinition.editable || this._isDisabled ||
          !isLocalTypeAttribute),
        type: (isLocalTypeAttribute ? this.getLocalType(propertyDefinition.
          propertyName) : this._itemRepository.getTreeConfig().getValue().
          config.getProxyFor(propertyDefinition.propertyName).item)
      }
    }).updateSize('90%', '90%').afterClosed().subscribe((result: any) => {
      if (result) {
        if (isLocalTypeAttribute) {
          this._object[propertyDefinition.propertyName] = result.object;
        } else {
          this._itemRepository.upsertItem(result.type.name, result.object);
        }
        
        this._changeDetectorRef.markForCheck();
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
        getIcon: (element: any) => {
          return this._itemRepository.getTreeConfig().getValue().config.
            getProxyFor('view-' + (element as ItemProxy).kind.toLowerCase()).
            item.icon;
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
    if (this._object[attributeDefinition.propertyName] == null) {
      this._object[attributeDefinition.propertyName] = [];
    }

    this.editValue(this._object[attributeDefinition.propertyName].length,
      attributeDefinition);
  }
  
  public async editValue(index: number, attributeDefinition:
    PropertyDefinition): Promise<void> {
    let attributeName: string = attributeDefinition.propertyName;
    const DIALOG_TITLE: string = 'Specify Value';
    let value: any = this._object[attributeName][index];
    let type: any = this._selectedType.classProperties[attributeDefinition.
      propertyName].definition.type;
    type = (Array.isArray(type) ? type[0] : type);
    switch (type) {
      case 'boolean':
        if (value == null) {
          value = false;
        }
        value = await this._dialogService.openDropdownDialog(DIALOG_TITLE, '',
          attributeName, value, undefined, [true, false]);
        if (value != null) {
          this._object[attributeName].splice(index, 1, value);
          this._changeDetectorRef.markForCheck();
        }
        break;
      case 'number':
        if (value == null) {
          value = 0;
        }
        
        value = await this._dialogService.openInputDialog(DIALOG_TITLE, '',
          InputDialogKind.NUMBER, attributeName, value, undefined);
        if (value != null) {
          this._object[attributeName].splice(index, 1, value);
          this._changeDetectorRef.markForCheck();
        }
        break;
      case 'date':
        if (value == null) {
          value = new Date().getTime();
        }
        
        value = await this._dialogService.openInputDialog(DIALOG_TITLE, '',
          InputDialogKind.DATE, attributeName, value, undefined);
        if (value != null) {
          this._object[attributeName].splice(index, 1, value);
          this._changeDetectorRef.markForCheck();
        }
        break;
      case 'string':
        if (value == null) {
          value = '';
        }
        
        value = await this._dialogService.openInputDialog(DIALOG_TITLE, '',
          InputDialogKind.STRING, attributeName, value, undefined);
        if (value) {
          this._object[attributeName].splice(index, 1, value);
          this._changeDetectorRef.markForCheck();
        }
        break;
      case 'text':
        if (value == null) {
          value = '';
        }
        
        value = await this._dialogService.openInputDialog(DIALOG_TITLE, '',
          InputDialogKind.STRING, attributeName, value, undefined);
        if (value) {
          this._object[attributeName].splice(index, 1, value);
          this._changeDetectorRef.markForCheck();
        }
        break;
      case 'maskedString':
        if (value == null) {
          value = '';
        }
        
        value = await this._dialogService.openInputDialog(DIALOG_TITLE, '',
          InputDialogKind.MASKED_STRING, attributeName, value, undefined);
        if (value) {
          this._object[attributeName].splice(index, 1, value);
          this._changeDetectorRef.markForCheck();
        }
        break;
      case 'markdown':
        if (value == null) {
          value = '';
        }
        
        value = await this._dialogService.openInputDialog(DIALOG_TITLE, '',
          InputDialogKind.MARKDOWN, attributeName, value, undefined);
        if (value) {
          this._object[attributeName].splice(index, 1, value);
          this._changeDetectorRef.markForCheck();
        }
        break;
      case 'state-editor':
        value = await this._dialogService.openDropdownDialog(DIALOG_TITLE,
          attributeName + ': ' + this._object[attributeName], 'Target', value,
          undefined, this.getStateTransitionCandidates(attributeDefinition).
          map((transitionCandidateName: string) => {
          return this._selectedType.classProperties[attributeName].definition.
            properties.transition[transitionCandidateName].target;
        }));
        if (value) {
          this._object[attributeName].splice(index, 1, value);
          this._changeDetectorRef.markForCheck();
        }
        break;
      case 'user-selector':
        if (value == null) {
          value = 'admin';
        }
        
        value = await this._dialogService.openDropdownDialog(DIALOG_TITLE, '',
          attributeName, value, undefined, this._usernames);
        if (value != null) {
          this._object[attributeName].splice(index, 1, value);
          this._changeDetectorRef.markForCheck();
        }
        break;
      default:
        let isLocalTypeAttribute: boolean = this.isLocalTypeAttribute(
          attributeName);
        if (isLocalTypeAttribute) {
          this._dialogService.openComponentDialog(FormatObjectEditorComponent, {
            data: {
              object: value,
              enclosingType: this._selectedType,
              formatDefinitionType: this._formatDefinitionType,
              disabled: (!attributeDefinition.editable || this._isDisabled),
              type: this.getLocalType(attributeDefinition.propertyName)
            }
          }).updateSize('90%', '90%').afterClosed().subscribe((result:
            any) => {
            if (result) {
              this._object[attributeName].splice(index, 1, result.object);
              this._changeDetectorRef.markForCheck();
            }
          });
        } else {
          this._dialogService.openComponentDialog(TreeComponent, {
            data: {
              root: TreeConfiguration.getWorkingTree().getRootProxy(),
              getChildren: (element: any) => {
                return (element as ItemProxy).children;
              },
              getText: (element: any) => {
                return (element as ItemProxy).item.name;
              },
              getIcon: (element: any) => {
                return this._itemRepository.getTreeConfig().getValue().config.
                  getProxyFor('view-' + (element as ItemProxy).kind.
                  toLowerCase()).item.icon;
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
        }
    }
  }
  
  public removeValue(index: number, attributeName: string): void {
    this._object[attributeName].splice(index, 1);
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
  
  public getStringRepresentation(koheseObject: any, attributeName: string,
    index: number, dataModel: any, viewModel: any): string {
    let value: any;
    if (index != null) {
      value = koheseObject[attributeName][index];
    } else {
      value = koheseObject[attributeName];
    }
    
    if ((attributeName === 'parentId') && (dataModel.classProperties[
      attributeName].definedInKind === 'Item') && ((typeof value) ===
      'string')) {
      return TreeConfiguration.getWorkingTree().getProxyFor(value).item.name;
    }
    
    let representation: string = String(value);
    if (representation === String({})) {
      let type: any = dataModel.classProperties[attributeName].definition.type;
      type = (Array.isArray(type) ? type[0] : type);
      if (dataModel.localTypes && dataModel.localTypes[type]) {
        if (value.name) {
          return value.name;
        } else if (value.id) {
          return value.id;
        } else {
          viewModel = viewModel.localTypes[type];
          let formatDefinitionId: string = viewModel.defaultFormatKey[this.
            _formatDefinitionType];
          if (!formatDefinitionId) {
            formatDefinitionId = viewModel.defaultFormatKey[
              FormatDefinitionType.DEFAULT];
          }
          let formatDefinition: FormatDefinition = viewModel.formatDefinitions[
            formatDefinitionId];
          for (let j: number = 0; j < formatDefinition.containers.length;
            j++) {
            if ((formatDefinition.containers.length > 0) && (formatDefinition.
              containers[0].kind !== FormatContainerKind.
              REVERSE_REFERENCE_TABLE) && (formatDefinition.containers[0].
              contents.length > 0)) {
              let propertyDefinition: PropertyDefinition = formatDefinition.
                containers[0].contents[0];
              return propertyDefinition.customLabel + ': ' + String(value[
                propertyDefinition.propertyName]);
            }
          }
          
          let firstAttributeName: string = Object.keys(value)[0];
          return firstAttributeName + ': ' + String(value[firstAttributeName]);
        }
      } else {
        return TreeConfiguration.getWorkingTree().getProxyFor(value.id).item.
          name;
      }
    } else {
      return representation;
    }
  }
}
