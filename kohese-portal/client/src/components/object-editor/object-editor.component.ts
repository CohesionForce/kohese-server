import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit,
  Input, Optional, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { DialogService,
  DialogComponent } from '../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { ProxySelectorDialogComponent } from '../user-input/k-proxy-selector/proxy-selector-dialog/proxy-selector-dialog.component';

@Component({
  selector: 'object-editor',
  templateUrl: './object-editor.component.html',
  styleUrls: ['./object-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObjectEditorComponent implements OnInit {
  private _object: any;
  @Input('object')
  set object(object: any) {
    this._object = object;
  }
  
  private _copy: any;
  get copy() {
    return this._copy;
  }
  
  private _type: any;
  get type() {
    return this._type;
  }
  @Input('type')
  set type(type: any) {
    this._type = type;
  }
  
  private _attributes: any = {};
  get attributes() {
    return this._attributes;
  }
  
  private _usernames: Array<string> = [];
  get usernames() {
    return this._usernames;
  }
  
  get data() {
    return this._data;
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

  public constructor(@Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    private _matDialogRef: MatDialogRef<ObjectEditorComponent>,
    private _changeDetectorRef: ChangeDetectorRef, private _dialogService:
    DialogService, private _dynamicTypesService: DynamicTypesService,
    private _itemRepository: ItemRepository) {
  }
  
  public ngOnInit(): void {
    if (this._data) {
      this._object = this._data['object'];
      this._type = this._data['type'];
    }
    
    if (Object.keys(this._dynamicTypesService.getKoheseTypes()).indexOf(this.
      _type.name) !== -1) {
      for (let attributeName in this._type.classProperties) {
        this._attributes[attributeName] = this._type.classProperties[
          attributeName].definition;
      }
    } else {
      this._attributes = this._type.properties;
    }
    
    if (this._object) {
      this._copy = JSON.parse(JSON.stringify(this._object));
    } else {
      this._copy = {};
      for (let attributeName in this._attributes) {
        if (this._attributes[attributeName].default != null) {
          this._copy[attributeName] = this._attributes[attributeName].default;
        } else {
          if (Array.isArray(this._attributes[attributeName].type)) {
            this._copy[attributeName] = [];
          } else {
            this._copy[attributeName] = undefined;
          }
        }
      }
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
  
  public getTypeName(typeValue: any): string {
    let type: string;
    if (Array.isArray(typeValue)) {
      type = typeValue[0];
    } else {
      type = typeValue;
    }
    
    return type;
  }
  
  public openObjectEditor(attributeName: string): void {
    let type: any = this.getType(attributeName);
    let isLocalTypeInstance: boolean = (Object.keys(this.
      _dynamicTypesService.getKoheseTypes()).indexOf(type.name) === -1);
    let value: any = this._copy[attributeName];
    this._dialogService.openComponentDialog(ObjectEditorComponent, {
      data: {
        object: ((!value || isLocalTypeInstance) ? value : TreeConfiguration.
          getWorkingTree().getProxyFor(value.id).item),
        type: type
      },
      disableClose: true
    }).updateSize('80%', '80%').afterClosed().subscribe((returnedObject:
      any) => {
      if (returnedObject) {
        if (isLocalTypeInstance) {
          this._copy[attributeName] = returnedObject;
        } else {
          this._itemRepository.upsertItem(returnedObject as ItemProxy);
        }
      }
    });
  }
  
  public openItemSelector(attributeName: string): void {
    this._dialogService.openComponentDialog(ProxySelectorDialogComponent, {
      data: {
        type: this.getTypeName(this._attributes[attributeName].type),
        selected: (this._copy[attributeName] ? TreeConfiguration.
          getWorkingTree().getProxyFor(this._copy[attributeName].id) :
          undefined)
      }
    }).updateSize('70%', '70%').afterClosed().subscribe((itemProxy:
      ItemProxy) => {
      if (itemProxy) {
        this._copy[attributeName] = { id: itemProxy.item.id };
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public addValue(attributeName: string): void {
    this.editValue(this._copy[attributeName].length, attributeName);
  }
  
  public editValue(index: number, attributeName: string): void {
    const DIALOG_TITLE: string = 'Specify Value';
    let value: any = this._copy[attributeName][index];
    switch (this.getTypeName(this._attributes[attributeName].type)) {
      case 'boolean':
        if (value == null) {
          value = false;
        }
        this._dialogService.openSelectDialog(DIALOG_TITLE, '',
          attributeName, value, [true, false]).afterClosed().subscribe(
          (value: boolean) => {
          if (value != null) {
            this._copy[attributeName].splice(index, 1, value);
            this._changeDetectorRef.markForCheck();
          }
        });
        break;
      case 'number':
        if (value == null) {
          value = 0;
        }
        
        this._dialogService.openInputDialog(DIALOG_TITLE, '', DialogComponent.
          INPUT_TYPES.NUMBER, attributeName, value).afterClosed().subscribe(
          (value: number) => {
          if (value != null) {
            this._copy[attributeName].splice(index, 1, value);
            this._changeDetectorRef.markForCheck();
          }
        });
        break;
      case 'date':
        if (value == null) {
          value = new Date().getTime();
        }
        
        this._dialogService.openInputDialog(DIALOG_TITLE, '', DialogComponent.
          INPUT_TYPES.DATE, attributeName, value).afterClosed().subscribe(
          (value: number) => {
          if (value != null) {
            this._copy[attributeName].splice(index, 1, value);
            this._changeDetectorRef.markForCheck();
          }
        });
        break;
      case 'string':
        if (value == null) {
          value = '';
        }
        
        this._dialogService.openInputDialog(DIALOG_TITLE, '', DialogComponent.
          INPUT_TYPES.TEXT, attributeName, value).afterClosed().subscribe(
          (value: string) => {
          if (value) {
            this._copy[attributeName].splice(index, 1, value);
            this._changeDetectorRef.markForCheck();
          }
        });
        break;
      case 'markdown':
        if (value == null) {
          value = '';
        }
        
        this._dialogService.openInputDialog(DIALOG_TITLE, '', DialogComponent.
          INPUT_TYPES.MARKDOWN, attributeName, value).afterClosed().subscribe(
          (value: string) => {
          if (value) {
            this._copy[attributeName].splice(index, 1, value);
            this._changeDetectorRef.markForCheck();
          }
        });
        break;
      case 'StateMachine':
        break;
      case 'user-selector':
        if (value == null) {
          value = 'admin';
        }
        
        this._dialogService.openSelectDialog(DIALOG_TITLE, '',
          attributeName, value, this._usernames).afterClosed().subscribe(
          (value: string) => {
          if (value != null) {
            this._copy[attributeName].splice(index, 1, value);
            this._changeDetectorRef.markForCheck();
          }
        });
        break;
      default:
        let type: any = this.getType(attributeName);
        let isLocalTypeInstance: boolean = (Object.keys(this.
          _dynamicTypesService.getKoheseTypes()).indexOf(type.name) === -1);
        this._dialogService.openComponentDialog(ObjectEditorComponent, {
          data: {
            object: ((!value || isLocalTypeInstance) ? value :
              TreeConfiguration.getWorkingTree().getProxyFor(value.id).item),
            type: type
          },
          disableClose: true
        }).updateSize('80%', '80%').afterClosed().subscribe((returnedObject:
          any) => {
          if (returnedObject) {
            if (isLocalTypeInstance) {
              this._copy[attributeName].splice(index, 1, returnedObject);
              this._changeDetectorRef.markForCheck();
            } else {
              this._itemRepository.upsertItem(returnedObject as ItemProxy);
            }
          }
        });
    }
  }
  
  public removeValue(index: number, attributeName: string): void {
    this._copy[attributeName].splice(index, 1);
    this._changeDetectorRef.markForCheck();
  }
  
  public getStateTransitionCandidates(attributeName: string): any {
    let stateTransitionCandidates: any = {};
    let currentStateName: string = this._copy[attributeName];
    let stateMachine: any = this._attributes[attributeName].properties;
    if (stateMachine) {
      for (let transitionName in stateMachine.transition) {
        let transition: any = stateMachine.transition[transitionName];
        if (transition.source === currentStateName) {
          stateTransitionCandidates[transitionName] = transition;
        }
      }
    }
    
    return stateTransitionCandidates;
  }
  
  public close(accept: boolean): void {
    if (accept) {
      if (!this._object) {
        this._object = {};
      }
      
      for (let attributeName in this._copy) {
        this._object[attributeName] = this._copy[attributeName];
      }
    }
    
    this._matDialogRef.close(accept ? this._object : undefined);
  }
  
  public getStringRepresentation(index: number, attributeName: string):
    string {
    let value: any;
    if (index != null) {
      value = this._copy[attributeName][index];
    } else {
      value = this._copy[attributeName];
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
  
  public getAttributeRepresentation(attributeName: string): string {
    let attributeRepresentation: string = attributeName;
    if (this._attributes[attributeName].required) {
      attributeRepresentation += '*';
    }
    
    return attributeRepresentation;
  }
  
  public isObjectValid(): boolean {
    for (let attributeName in this._attributes) {
      if (this._attributes[attributeName].required && this._copy[
        attributeName] == null) {
        return false;
      }
    }
    
    return true;
  }
  
  private getType(attributeName: string): any {
    let typeName: string = this.getTypeName(this._attributes[attributeName].
      type);
    let type: any;
    if (this._type.localTypes) {
      for (let j: number = 0; j < this._type.localTypes.length; j++) {
        let localType: any = this._type.localTypes[j];
        if (localType.name === typeName) {
          type = localType;
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
