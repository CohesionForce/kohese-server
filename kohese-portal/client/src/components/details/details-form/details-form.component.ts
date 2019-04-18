import {
  Component, Input, Output, OnInit, OnDestroy, OnChanges,
  SimpleChanges, EventEmitter
} from '@angular/core';
import {
  FormGroup, FormBuilder, Validators,
} from '@angular/forms';

import { NavigatableComponent } from '../../../classes/NavigationComponent.class'
import { NavigationService } from '../../../services/navigation/navigation.service';
import { ObjectEditorComponent } from '../../object-editor/object-editor.component';

import { ItemProxy } from '../../../../../common/src/item-proxy.js';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';
import { DialogService } from '../../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
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
  itemProxy: ItemProxy;

  private _nonFormFieldMap: Map<string, any> = new Map<string, any>();
  get nonFormFieldMap() {
    return this._nonFormFieldMap;
  }
  @Output()
  public nonFormFieldChanged: EventEmitter<any> = new EventEmitter<any>();

  /* Utils */
  public formGroup: FormGroup;

  /* Subscriptions */
  private editableStreamSubscription: Subscription;
  private _fieldFilterSubscription: Subscription;
  private _proxyStreamSubscription: Subscription;
  
  get Array() {
    return Array;
  }

  constructor(protected NavigationService: NavigationService,
    private FormBuilder: FormBuilder,
    private DynamicTypeService: DynamicTypesService, private _dialogService:
    DialogService) {
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
        this.itemProxy = newProxy;
        this.type = this.DynamicTypeService.getKoheseTypes()[newProxy.kind];
        this.formGroup = this.createFormGroup();
        this.formGroupUpdated.emit(this.formGroup);
      }
    });

    this._fieldFilterSubscription = this.fieldFilterStream.subscribe(
      (fieldFilter: Function) => {
      this.formGroup = this.createFormGroup();
      this.formGroupUpdated.emit(this.formGroup);
    });

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

  createFormGroup (): FormGroup {
    const group = this.FormBuilder.group(this.buildPropertyMap(true));
    if (!this.editableStream.getValue()) {
      group.disable();
    }
    return group;
  }

  getFormGroup(): FormGroup {
    return this.formGroup;
  }

  buildPropertyMap(includeValidation: boolean): any {
    let propertyMap: any = {};
    for (let propertyKey in this.type.fields) {
      if (this.fieldFilterStream.getValue()(propertyKey)) {
        let currentProperty: any = this.type.fields[propertyKey];
        let defaultValue: any = (this.proxyStream.getValue() ?
          this.proxyStream.getValue().item[propertyKey] : currentProperty.
            default);
        if (includeValidation && currentProperty.required) {
          propertyMap[propertyKey] = [defaultValue, Validators.required];
        } else {
          propertyMap[propertyKey] = [defaultValue];
        }
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
  
  public openObjectEditor(attributeName: string): void {
    this._dialogService.openComponentDialog(ObjectEditorComponent, {
      data: {
        object: this.proxyStream.getValue().item[attributeName],
        type: this.getType(attributeName)
      },
      disableClose: true
    }).updateSize('90%', '90%').afterClosed().subscribe((returnedObject:
      any) => {
      if (returnedObject) {
        this.proxyStream.getValue().item[attributeName] = returnedObject;
        this.whenNonFormFieldChanges(attributeName, returnedObject);
      }
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
  
  public addValue(attributeName: string): void {
    let item: any = this.proxyStream.getValue().item;
    // Migration code
    if (item[attributeName] == null) {
      item[attributeName] = [];
    }
    
    this.editValue(item[attributeName].length, attributeName);
  }
  
  public editValue(index: number, attributeName: string): void {
    this._dialogService.openComponentDialog(ObjectEditorComponent, {
      data: {
        object: this.proxyStream.getValue().item[attributeName][index],
        type: this.getType(attributeName)
      },
      disableClose: true
    }).updateSize('80%', '80%').afterClosed().subscribe((returnedObject:
      any) => {
      if (returnedObject) {
        this.proxyStream.getValue().item[attributeName].splice(index, 1,
          returnedObject);
        this.whenNonFormFieldChanges(attributeName, this.proxyStream.
          getValue().item[attributeName]);
      }
    });
  }
  
  public removeValue(index: number, attributeName: string): void {
    this.proxyStream.getValue().item[attributeName].splice(index, 1);
    this.whenNonFormFieldChanges(attributeName, this.proxyStream.getValue().
      item[attributeName]);
  }
  
  private getType(attributeName: string): any {
    let typeName: string = this.getTypeName(this.type.dataModelProxy.item.
      properties[attributeName].type);
    let type: any;
    if (this.type.dataModelProxy.item.localTypes) {
      for (let j: number = 0; j < this.type.dataModelProxy.item.localTypes.
        length; j++) {
        let localType: any = this.type.dataModelProxy.item.localTypes[j];
        if (localType.name === typeName) {
          type = localType;
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
