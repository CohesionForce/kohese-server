import {
  Component, Input, Output, OnInit, OnDestroy, OnChanges,
  SimpleChanges, EventEmitter
} from '@angular/core';
import {
  FormGroup, FormBuilder, Validators,
  AbstractControl
} from '@angular/forms';

import { NavigatableComponent } from '../../../classes/NavigationComponent.class'
import { NavigationService } from '../../../services/navigation/navigation.service';

import { ItemProxy } from '../../../../../common/src/item-proxy.js';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

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
  editableStream: BehaviorSubject<boolean>
  @Input()
  public fieldFilterStream: BehaviorSubject<((fieldName: string) => boolean)>;
  @Output()
  formGroupUpdated = new EventEmitter<FormGroup>();

  private initialized : boolean;
  
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

  constructor(protected NavigationService: NavigationService,
    private FormBuilder: FormBuilder,
    private DynamicTypeService: DynamicTypesService) {
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

    this._fieldFilterSubscription = this.fieldFilterStream.subscribe(
      (fieldFilter: Function) => {
      this.formGroup = this.createFormGroup();
      this.formGroupUpdated.emit(this.formGroup);
    });
    
    this._proxyStreamSubscription = this.proxyStream.subscribe(
      (newProxy: ItemProxy) => {
      if (newProxy) {
        this.type = this.DynamicTypeService.getKoheseTypes()[newProxy.kind];
        this.formGroup = this.createFormGroup();
        this.formGroupUpdated.emit(this.formGroup);
      }
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
        this.type = this.DynamicTypeService.getKoheseTypes()[changes['type'].currentValue]
      }
    }
  }

  createFormGroup () : FormGroup {
    const group = this.FormBuilder.group(this.buildPropertyMap(true));
    //this.config.forEach(control => group.addControl(control.name, this.FormBuilder.control()));
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
      let currentProperty: any = this.type.fields[propertyKey];
      let defaultValue: any = (this.proxyStream.getValue() ?
        this.proxyStream.getValue().item[propertyKey] : currentProperty.
          default);
      if (includeValidation && currentProperty.required) {
        propertyMap[propertyKey] = [defaultValue, Validators.required];
      } else {
        propertyMap[propertyKey] = defaultValue;
      }
    }
    return propertyMap;
  }

  public whenNonFormFieldChanges(fieldName: string, fieldValue, any): void {
    this._nonFormFieldMap.set(fieldName, fieldValue);
    this.nonFormFieldChanged.emit({
      fieldName: fieldName,
      fieldValue: fieldValue
    });
  }
}
