import { Component, Input, Output, OnInit, OnDestroy, OnChanges, SimpleChanges,
  EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

import { NavigatableComponent } from '../../../classes/NavigationComponent.class'
import { NavigationService } from '../../../services/navigation/navigation.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { ObjectEditorComponent } from '../../object-editor/object-editor.component';
import { ProxySelectorDialogComponent } from '../../user-input/k-proxy-selector/proxy-selector-dialog/proxy-selector-dialog.component';

import { ItemProxy } from '../../../../../common/src/item-proxy.js';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';
import { DialogService,
  DialogComponent } from '../../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { StateService } from '../../../services/state/state.service';
import { Subscription ,  BehaviorSubject } from 'rxjs';

@Component({
  selector: 'details-form',
  templateUrl: './details-form.component.html',
  styleUrls: ['./details-form.component.scss']
})

export class DetailsFormComponent extends NavigatableComponent
  implements OnInit, OnDestroy, OnChanges {
  /* Data */
  @Input()
  public type: KoheseType;
  @Input()
  public proxyStream: BehaviorSubject<ItemProxy>;
  @Input()
  editableStream: BehaviorSubject<boolean>;
  @Input()
  public fieldFilterStream: BehaviorSubject<((fieldName: string) => boolean)>;
  @Output()
  formGroupUpdated = new EventEmitter<FormGroup>();

  private initialized: boolean;

  private _nonFormFieldMap: Map<string, any> = new Map<string, any>();
  get nonFormFieldMap() {
    return this._nonFormFieldMap;
  }
  @Output()
  public nonFormFieldChanged: EventEmitter<any> = new EventEmitter<any>();

  private _usernames: Array<string> = [];
  get usernames() {
    return this._usernames;
  }
  
  private _transitionCandidates: any;
  get transitionCandidates() {
    return this._transitionCandidates;
  }
  private _transitionCandidateAttributeNames: Array<string>;
  get transitionCandidateAttributeNames() {
    return this._transitionCandidateAttributeNames;
  }

  /* Utils */
  public formGroup: FormGroup;

  /* Subscriptions */
  private editableStreamSubscription: Subscription;
  private _fieldFilterSubscription: Subscription;
  private _proxyStreamSubscription: Subscription;

  get Array() {
    return Array;
  }

  get Object() {
    return Object;
  }

  get dynamicTypesService() {
    return this.DynamicTypeService;
  }

  constructor(protected NavigationService: NavigationService,
    private FormBuilder: FormBuilder,
    private DynamicTypeService: DynamicTypesService, private _dialogService:
    DialogService, private _itemRepository: ItemRepository,
    private _stateService: StateService) {
    super(NavigationService);
    this.initialized = false;
  }

  ngOnInit() {
    if (!this.editableStream) {
      // Set editable stream as defaulted to true when it is not provided
      this.editableStream = new BehaviorSubject<boolean>(true);
    }

    this.editableStreamSubscription = this.editableStream.subscribe(
      (editable: boolean) => {
        if (this.formGroup) {
          if (editable) {
            this.formGroup.enable();
          } else {
            this.formGroup.disable();
          }
        }
      });

    if (!this.fieldFilterStream) {
      this.fieldFilterStream =
        new BehaviorSubject<((fieldName: string) => boolean)>(
          ((fieldName: string) => {
            return true;
          }));
    }

    this._proxyStreamSubscription = this.proxyStream.subscribe(
      (newProxy: ItemProxy) => {
      if (newProxy) {
        this.type = this.DynamicTypeService.getKoheseTypes()[newProxy.kind];
        this.formGroup = this.createFormGroup();
        this.formGroupUpdated.emit(this.formGroup);
        
        this._transitionCandidates = this._stateService.
          getTransitionCandidates(newProxy);
        this._transitionCandidateAttributeNames = Object.keys(this.
          _transitionCandidates);
      }
    });

    this._fieldFilterSubscription = this.fieldFilterStream.subscribe(
      (fieldFilter: Function) => {
      this.formGroup = this.createFormGroup();
      this.formGroupUpdated.emit(this.formGroup);
    });

    TreeConfiguration.getWorkingTree().getRootProxy().visitTree({
      includeOrigin: false
    }, (itemProxy: ItemProxy) => {
      if (itemProxy.kind === 'KoheseUser') {
        this._usernames.push(itemProxy.item.name);
      }
    });
    this._usernames.sort();
    
    this.initialized = true;
  }

  ngOnDestroy() {
    this._proxyStreamSubscription.unsubscribe();
    this._fieldFilterSubscription.unsubscribe();
    this.editableStreamSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized) {
      let changedInputs: Array<string> = Object.keys(changes);

      if (changes['type']) {
        this.type = changes['type'].currentValue;
      }
    }
  }

  public typeChanged(type: string): void {
    let itemProxy: ItemProxy = this.proxyStream.getValue();
    itemProxy.kind = type;
    let typeProxy: ItemProxy = TreeConfiguration.getWorkingTree().getProxyFor(
      type);
    itemProxy.model = typeProxy;
    for (let attributeName in typeProxy.item.classProperties) {
      if (itemProxy.item[attributeName] == null) {
        let modelProxy: ItemProxy = TreeConfiguration.getWorkingTree().
          getProxyFor(typeProxy.item.classProperties[attributeName].
          definedInKind);
        if (modelProxy.item.properties[attributeName].default != null) {
          itemProxy.item[attributeName] = modelProxy.item.properties[
            attributeName].default;
        }
      }
    }
    
    this.proxyStream.next(itemProxy);
  }

  createFormGroup (): FormGroup {
    const group = this.FormBuilder.group(this.buildPropertyMap());
    if (!this.editableStream.getValue()) {
      group.disable();
    }
    return group;
  }

  getFormGroup(): FormGroup {
    return this.formGroup;
  }

  buildPropertyMap(): any {
    let propertyMap: any = {};
    for (let propertyKey in this.type.fields) {
      if (this.fieldFilterStream.getValue()(propertyKey)) {
        let currentProperty: any = this.type.fields[propertyKey];
        let defaultValue: any = (this.proxyStream.getValue() ?
          this.proxyStream.getValue().item[propertyKey] : currentProperty.
            default);
        propertyMap[propertyKey] = [defaultValue];
      }
    }
    return propertyMap;
  }

  public whenNonFormFieldChanges(fieldName: string, fieldValue: any): void {
    this._nonFormFieldMap.set(fieldName, fieldValue);
    this.nonFormFieldChanged.emit({
      fieldName: fieldName,
      fieldValue: fieldValue
    });
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
      DynamicTypeService.getKoheseTypes()).indexOf(type.name) === -1);
    let value: any = this.proxyStream.getValue().item[attributeName];
    this._dialogService.openComponentDialog(ObjectEditorComponent, {
      data: {
        object: ((!value || isLocalTypeInstance) ? value : TreeConfiguration.
          getWorkingTree().getProxyFor(value.id).item),
        type: type
      }
    }).updateSize('80%', '80%').afterClosed().subscribe((returnedObject:
      any) => {
      if (returnedObject) {
        if (isLocalTypeInstance) {
          this.proxyStream.getValue().item[attributeName] = returnedObject;
          this.whenNonFormFieldChanges(attributeName, returnedObject);
        } else {
          let itemProxy: ItemProxy = (returnedObject as ItemProxy);
          this._itemRepository.upsertItem(itemProxy.kind, itemProxy.item);
        }
      }
    });
  }

  public openObjectSelector(attributeName: string): void {
    let type: any = this.getType(attributeName);
    let isLocalTypeInstance: boolean = (Object.keys(this.
      DynamicTypeService.getKoheseTypes()).indexOf(type.name) === -1);
    if (isLocalTypeInstance) {
      this._dialogService.openComponentDialog(ObjectEditorComponent, {
        data: {
          object: this.proxyStream.getValue().item[attributeName],
          type: type
        }
      }).updateSize('90%', '90%').afterClosed().subscribe((localTypeInstance:
        any) => {
        if (localTypeInstance) {
          this.proxyStream.getValue().item[attributeName] = localTypeInstance;
          this.whenNonFormFieldChanges(attributeName, localTypeInstance);
        }
      });
    } else {
      this._dialogService.openComponentDialog(ProxySelectorDialogComponent, {
        data: {
          type: this.getTypeName(this.type.fields[attributeName].type),
          selected: (this.proxyStream.getValue().item[attributeName] ?
            TreeConfiguration.getWorkingTree().getProxyFor(this.proxyStream.
            getValue().item[attributeName].id) : undefined)
        }
      }).updateSize('70%', '70%').afterClosed().subscribe((itemProxy:
        ItemProxy) => {
        if (itemProxy) {
          this.proxyStream.getValue().item[attributeName] = {
            id: itemProxy.item.id
          };
          this.whenNonFormFieldChanges(attributeName, this.proxyStream.
            getValue().item[attributeName]);
        }
      });
    }
  }

  public addValue(attributeName: string): void {
    // Migration code
    if (!this.proxyStream.getValue().item[attributeName]) {
      this.proxyStream.getValue().item[attributeName] = [];
    }

    this.editValue(this.proxyStream.getValue().item[attributeName].length,
      attributeName);
  }

  public editValue(index: number, attributeName: string): void {
    const DIALOG_TITLE: string = 'Specify Value';
    let value: any = this.proxyStream.getValue().item[attributeName][index];
    switch (this.getTypeName(this.type.fields[attributeName].type)) {
      case 'boolean':
        if (value == null) {
          value = false;
        }
        this._dialogService.openSelectDialog(DIALOG_TITLE, '',
          attributeName, value, [true, false]).afterClosed().subscribe(
          (value: boolean) => {
          if (value != null) {
            this.proxyStream.getValue().item[attributeName].splice(index, 1,
              value);
            this.whenNonFormFieldChanges(attributeName, this.proxyStream.
              getValue().item[attributeName]);
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
            this.proxyStream.getValue().item[attributeName].splice(index, 1,
              value);
            this.whenNonFormFieldChanges(attributeName, this.proxyStream.
              getValue().item[attributeName]);
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
            this.proxyStream.getValue().item[attributeName].splice(index, 1,
              value);
            this.whenNonFormFieldChanges(attributeName, this.proxyStream.
              getValue().item[attributeName]);
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
            this.proxyStream.getValue().item[attributeName].splice(index, 1,
              value);
            this.whenNonFormFieldChanges(attributeName, this.proxyStream.
              getValue().item[attributeName]);
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
            this.proxyStream.getValue().item[attributeName].splice(index, 1,
              value);
            this.whenNonFormFieldChanges(attributeName, this.proxyStream.
              getValue().item[attributeName]);
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
            this.proxyStream.getValue().item[attributeName].splice(index, 1,
              value);
            this.whenNonFormFieldChanges(attributeName, this.proxyStream.
              getValue().item[attributeName]);
          }
        });
        break;
      default:
        let type: any = this.getType(attributeName);
        let isLocalTypeInstance: boolean = (Object.keys(this.
          DynamicTypeService.getKoheseTypes()).indexOf(type.name) === -1);
        if (!isLocalTypeInstance) {
          this._dialogService.openComponentDialog(
            ProxySelectorDialogComponent, {
            data: {
              type: this.getTypeName(this.type.fields[attributeName].type),
              selected: (this.proxyStream.getValue().item[attributeName] ?
                TreeConfiguration.getWorkingTree().getProxyFor(this.
                proxyStream.getValue().item[attributeName].id) : undefined)
            }
          }).updateSize('70%', '70%').afterClosed().subscribe((itemProxy:
            ItemProxy) => {
            if (itemProxy) {
              this.proxyStream.getValue().item[attributeName].splice(index,
                1, {
                id: itemProxy.item.id
              });
              this.whenNonFormFieldChanges(attributeName, this.proxyStream.
                getValue().item[attributeName]);
            }
          });
        } else {
          this._dialogService.openComponentDialog(ObjectEditorComponent, {
            data: {
              object: ((!value || isLocalTypeInstance) ? value :
                TreeConfiguration.getWorkingTree().getProxyFor(value.id).item),
              type: type
            }
          }).updateSize('80%', '80%').afterClosed().subscribe((returnedObject:
            any) => {
            if (returnedObject) {
              if (isLocalTypeInstance) {
                this.proxyStream.getValue().item[attributeName].splice(index,
                  1, returnedObject);
                this.whenNonFormFieldChanges(attributeName, this.proxyStream.
                  getValue().item[attributeName]);
              } else {
                let itemProxy: ItemProxy = (returnedObject as ItemProxy);
                this._itemRepository.upsertItem(itemProxy.kind, itemProxy.
                  item);
              }
            }
          });
        }
    }
  }

  public removeValue(index: number, attributeName: string): void {
    this.proxyStream.getValue().item[attributeName].splice(index, 1);
    this.whenNonFormFieldChanges(attributeName, this.proxyStream.getValue().
      item[attributeName]);
  }

  public getStateTransitionCandidates(attributeName: string): any {
    let stateTransitionCandidates: any = {};
    let currentStateName: string = this.proxyStream.getValue().item[
      attributeName];
    let stateMachine: any = this.type.fields[attributeName].properties;
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

  public getStringRepresentation(index: number, attributeName: string):
    string {
    let value: any;
    if (index != null) {
      value = this.proxyStream.getValue().item[attributeName][index];
    } else {
      value = this.proxyStream.getValue().item[attributeName];
    }

    let representation: string = String(value);
    if (representation === String({})) {
      let type: any = this.getType(attributeName);
      if (Object.keys(this.DynamicTypeService.getKoheseTypes()).indexOf(type.
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
    if (this.type.fields[attributeName].required) {
      attributeRepresentation += '*';
    }

    return attributeRepresentation;
  }
  
  public transition(fieldName: string, candidate: string): void {
    this.whenNonFormFieldChanges(fieldName, candidate);
    let itemProxy: ItemProxy = this.proxyStream.getValue();
    itemProxy.item[fieldName] = candidate;
    this._transitionCandidates = this._stateService.
      getTransitionCandidates(itemProxy);
    this._transitionCandidateAttributeNames = Object.keys(this.
      _transitionCandidates);
  }

  private getType(attributeName: string): any {
    let typeName: string = this.getTypeName(this.type.dataModelProxy.item.
      properties[attributeName].type);
    let type: any;
    if (this.type.dataModelProxy.item.localTypes) {
      for (let localTypeName in this.type.dataModelProxy.item.localTypes) {
        if (localTypeName === typeName) {
          type = this.type.dataModelProxy.item.localTypes[localTypeName];
          break;
        }
      }
    }

    if (!type) {
      let koheseTypes: any = this.DynamicTypeService.getKoheseTypes();
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
