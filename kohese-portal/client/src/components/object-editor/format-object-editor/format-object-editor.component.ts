import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit,
  Input, Optional, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { DialogService,
  DialogComponent } from '../../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { PropertyDefinition } from '../../type-editor/PropertyDefinition.interface';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { ProxySelectorDialogComponent } from '../../user-input/k-proxy-selector/proxy-selector-dialog/proxy-selector-dialog.component';

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
    if (this._type) {
      this._viewModel = TreeConfiguration.getWorkingTree().getProxyFor(
        'view-' + this._type.name.toLowerCase()).item;
    }
    
    this._changeDetectorRef.markForCheck();
  }
  
  private _type: any;
  get type() {
    return this._type;
  }
  @Input('type')
  set type(type: any) {
    this._type = type;
    this.object = this._object;
  }
  
  private _isDisabled: boolean = false;
  get isDisabled() {
    return this._isDisabled;
  }
  @Input('disabled')
  set isDisabled(isDisabled: boolean) {
    this._isDisabled = isDisabled;
  }
  
  private _viewModel: any;
  get viewModel() {
    return this._viewModel;
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

  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef:
    MatDialogRef<FormatObjectEditorComponent>, private _dialogService:
    DialogService, private _dynamicTypesService: DynamicTypesService,
    private _itemRepository: ItemRepository) {
  }
  
  public ngOnInit(): void {
    if (this.isDialogInstance()) {
      this._object = this._data['object'];
      this._type = this._data['type'];
    }
    
    this.object = this._object;
    
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
  
  public openObjectEditor(attributeName: string): void {
    let type: any = this.getType(attributeName);
    let isLocalTypeInstance: boolean = (Object.keys(this.
      _dynamicTypesService.getKoheseTypes()).indexOf(type.name) === -1);
    let value: any = this._object[attributeName];
    this._dialogService.openComponentDialog(FormatObjectEditorComponent, {
      data: {
        object: ((!value || isLocalTypeInstance) ? value : TreeConfiguration.
          getWorkingTree().getProxyFor(value.id).item),
        type: type
      },
      disableClose: true
    }).updateSize('80%', '80%').afterClosed().subscribe((result: any) => {
      if (result.object) {
        if (isLocalTypeInstance) {
          this._object[attributeName] = result.object;
        } else {
          this._itemRepository.upsertItem(result.type.name, result.object);
        }
      }
    });
  }
  
  public openObjectSelector(attributeName: string): void {
    let type: any = this.getType(attributeName);
    let isLocalTypeInstance: boolean = (Object.keys(this.
      _dynamicTypesService.getKoheseTypes()).indexOf(type.name) === -1);
    if (isLocalTypeInstance) {
      this._dialogService.openComponentDialog(FormatObjectEditorComponent, {
        data: {
          object: this._object[attributeName],
          type: type
        }
      }).updateSize('90%', '90%').afterClosed().subscribe((result: any) => {
        if (result) {
          this._object[attributeName] = result.object;
          this._changeDetectorRef.markForCheck();
        }
      });
    } else {
      this._dialogService.openComponentDialog(ProxySelectorDialogComponent, {
        data: {
          type: this.getTypeName(this._type.classProperties[attributeName].
            definition.type),
          selected: (this._object[attributeName] ? TreeConfiguration.
            getWorkingTree().getProxyFor(this._object[attributeName].id) :
            undefined)
        }
      }).updateSize('70%', '70%').afterClosed().subscribe((itemProxy:
        ItemProxy) => {
        if (itemProxy) {
          this._object[attributeName] = { id: itemProxy.item.id };
          this._changeDetectorRef.markForCheck();
        }
      });
    }
  }
  
  public addValue(attributeDefinition: PropertyDefinition): void {
    this.editValue(this._object[attributeDefinition.propertyName.attribute].
      length, attributeDefinition);
  }
  
  public editValue(index: number, attributeDefinition: PropertyDefinition):
    void {
    let attributeName: string = attributeDefinition.propertyName.attribute;
    const DIALOG_TITLE: string = 'Specify Value';
    let value: any = this._object[attributeName][index];
    switch (this.getTypeName(this._type.classProperties[attributeName].
      definition.type)) {
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
          return this._type.classProperties[attributeName].definition.
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
        let isLocalTypeInstance: boolean = (Object.keys(this.
          _dynamicTypesService.getKoheseTypes()).indexOf(type.name) === -1);
        if (!isLocalTypeInstance) {
          this._dialogService.openComponentDialog(
            ProxySelectorDialogComponent, {
            data: {
              type: this.getTypeName(this._type.classProperties[attributeName].
                definition.type),
              selected: (this._object[attributeName] ? TreeConfiguration.
                getWorkingTree().getProxyFor(this._object[attributeName].id) :
                undefined)
            }
          }).updateSize('70%', '70%').afterClosed().subscribe((itemProxy:
            ItemProxy) => {
            if (itemProxy) {
              this._object[attributeName].splice(index, 1,
                { id: itemProxy.item.id });
              this._changeDetectorRef.markForCheck();
            }
          });
        } else {
          this._dialogService.openComponentDialog(FormatObjectEditorComponent, {
            data: {
              object: ((!value || isLocalTypeInstance) ? value :
                TreeConfiguration.getWorkingTree().getProxyFor(value.id).item),
              type: type
            },
            disableClose: true
          }).updateSize('80%', '80%').afterClosed().subscribe((result:
            any) => {
            if (result.object) {
              if (isLocalTypeInstance) {
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
  
  public isKindAttribute(attributeDefinition: PropertyDefinition): boolean {
    let typeAttributeObject: any = this._type.classProperties[
      attributeDefinition.propertyName.attribute];
    return (typeAttributeObject && (typeAttributeObject.definedInKind ===
      TreeConfiguration.getWorkingTree().getProxyFor(attributeDefinition.
      propertyName.kind).item.classProperties[attributeDefinition.propertyName.
      attribute].definedInKind));
  }
  
  public getTableElements(attributeDefinition: PropertyDefinition):
    Array<any> {
    if (this.isKindAttribute(attributeDefinition)) {
      if (this._object[attributeDefinition.propertyName.attribute]) {
        return this._object[attributeDefinition.propertyName.attribute].map(
          (reference: { id: string }) => {
          return TreeConfiguration.getWorkingTree().getProxyFor(reference.id).
            item;
        });
      }
    } else {
      let references: any = TreeConfiguration.getWorkingTree().getProxyFor(
        this._object.id).relations.referencedBy[attributeDefinition.
        propertyName.kind];
      if (references) {
        let upstreamKindAttributeReferences: Array<ItemProxy> =
          references[attributeDefinition.propertyName.attribute];
        if (upstreamKindAttributeReferences) {
          return upstreamKindAttributeReferences.map((itemProxy:
            ItemProxy) => {
            return itemProxy.item;
          });
        }
      }
    }
    
    return [];
  }
  
  public getTableElementName(element: any): string {
    return element.name;
  }
  
  public getTableColumns(attributeDefinition: PropertyDefinition):
    Array<string> {
    return TreeConfiguration.getWorkingTree().getProxyFor('view-' +
      TreeConfiguration.getWorkingTree().getProxyFor(attributeDefinition.
      propertyName.kind).item.classProperties[attributeDefinition.propertyName.
      attribute].definition.type[0].toLowerCase()).item.tableDefinitions[
      attributeDefinition['tableDefinition']].columns;
  }
  
  public getTableElementAdditionFunction(attributeDefinition:
    PropertyDefinition): () => Promise<Array<any>> {
    return async () => {
      let references: Array<{ id: string }> = this._object[attributeDefinition.
        propertyName.attribute];
      let selection: any = await this._dialogService.openComponentDialog(
        ProxySelectorDialogComponent, {
        data: {
          selected: references.map((reference: { id: string }) => {
            return TreeConfiguration.getWorkingTree().getProxyFor(reference.
              id);
          }),
          allowMultiSelect: true
        },
        disableClose: true
      }).updateSize('70%', '70%').afterClosed().toPromise();
      
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
        propertyName.attribute];
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
        this._object[attributeDefinition.propertyName.attribute].splice(this.
          _object[attributeDefinition.propertyName.attribute].map((reference:
            { id: string }) => {
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
      customLabel : attributeDefinition.propertyName.attribute) +
      (TreeConfiguration.getWorkingTree().getProxyFor(attributeDefinition.
      propertyName.kind).item.classProperties[attributeDefinition.propertyName.
      attribute].definition.required ? '*' : ''));
  }
  
  public getStateTransitionCandidates(attributeDefinition: PropertyDefinition):
    Array<string> {
    let stateTransitionCandidates: Array<string> = [];
    let currentStateName: string = this._object[attributeDefinition.
      propertyName.attribute];
    let stateMachine: any = this._type.classProperties[attributeDefinition.
      propertyName.attribute].definition.properties;
    for (let transitionName in stateMachine.transition) {
      if (stateMachine.transition[transitionName].source ===
        currentStateName) {
        stateTransitionCandidates.push(transitionName);
      }
    }
    
    return stateTransitionCandidates;
  }
  
  public close(accept: boolean): any {
    let result: any = {
      type: this._type,
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
      let type: any = this.getType(attributeName);
      if (Object.keys(this._dynamicTypesService.getKoheseTypes()).indexOf(type.
        name) === -1) {
        representation = type.name;
      } else {
        representation = TreeConfiguration.getWorkingTree().getProxyFor(value.
          id).item.name;
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
    let typeName: string = this.getTypeName(this._type.classProperties[
      attributeName].definition.type);
    let type: any;
    if (this._type.localTypes) {
      for (let localTypeName in this._type.localTypes) {
        if (localTypeName === typeName) {
          type = this._type.localTypes[localTypeName];
          break;
        }
      }
    }
    
    if (!type) {
      let koheseTypes: any = this._dynamicTypesService.getKoheseTypes();
      for (let koheseTypeName in koheseTypes) {
        if (koheseTypeName === typeName) {
          type = koheseTypes[koheseTypeName].dataModelProxy.item;
          break;
        }
      }
    }
    
    return type;
  }
}
