import { Component, Input, Output, OnInit, OnDestroy, OnChanges,
  SimpleChanges, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators,
  AbstractControl } from '@angular/forms';

import { NavigatableComponent } from '../../../classes/NavigationComponent.class'
import { NavigationService } from '../../../services/navigation/navigation.service';

import { ItemProxy } from '../../../../../common/src/item-proxy.js';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';
import { ItemRepository, RepoStates } from '../../../services/item-repository/item-repository.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { StateService } from '../../../services/state/state.service';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'details-form',
  templateUrl : './details-form.component.html',
  styleUrls: ['./details-form.component.scss']
})

export class DetailsFormComponent extends NavigatableComponent
  implements OnInit, OnDestroy, OnChanges {
  /* Data */
  @Input()
  public type : KoheseType;
  @Input()
  public itemProxy: ItemProxy;
  @Input()
  public disabled: boolean;
  @Input()
  public fieldFilter: ((fieldName: string) => boolean);
  @Input() 
  createInfo : any;
  @Output()
  formGroupUpdated = new EventEmitter<FormGroup>();

  public properties: any = {};
  private initialized : boolean;
  
  @Output()
  private nonFormFieldChanged: EventEmitter<any> = new EventEmitter<any>();

  /* Utils */
  public formGroup : FormGroup;
  
  /* Subscriptions */
  private repoStatusSubscription : Subscription;

  constructor(protected NavigationService : NavigationService,
              private FormBuilder : FormBuilder,
              private DynamicTypeService: DynamicTypesService,
              private ItemRepository : ItemRepository) {
    super(NavigationService);
    this.initialized = false;
  }

  ngOnInit () {
    if (!this.fieldFilter) {
      this.fieldFilter = ((fieldName: string) => {
        return true;
      });
    }
    
    this.repoStatusSubscription = this.ItemRepository.getRepoStatusSubject()
    .subscribe((update) => {
      if (RepoStates.SYNCHRONIZATION_SUCCEEDED === update.state) {
        if (this.itemProxy) {
          this.type = this.DynamicTypeService.getKoheseTypes()[this.itemProxy.kind];
        } else if (this.createInfo) {
          this.buildStubProxy();
          }
        if (this.itemProxy) {
          this.updateProperties();      
          this.formGroup = this.createFormGroup();
          this.formGroupUpdated.emit(this.formGroup);
        }
      }
    });
    
    this.initialized = true;
  }

  ngOnDestroy () {
    this.repoStatusSubscription.unsubscribe();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized) {
      let changedInputs: Array<string> = Object.keys(changes);

      if(changes['itemProxy']) {
        this.itemProxy = changes['itemProxy'].currentValue;
        this.type = this.DynamicTypeService.getKoheseTypes()[this.itemProxy.kind];
        this.updateProperties();
        this.formGroup = this.createFormGroup();
        console.log(':: Form Group Updated');
        console.log(this.formGroup);
        this.formGroupUpdated.emit(this.formGroup);
      }

      if(changes['type']) {
        this.type = this.DynamicTypeService.getKoheseTypes()[changes['type'].currentValue]
      }

      if(changes['createInfo']) {
        this.createInfo = changes['createInfo'].currentValue;
        this.buildStubProxy();
      }

      if (changes['disabled']) {
        this.disabled = changes['disabled'].currentValue;
        if (this.disabled) { 
            this.formGroup = this.createFormGroup();
            this.formGroupUpdated.emit(this.formGroup);
            this.formGroup.disable();
          } else {
            this.formGroup.enable();
          }
        }
    }
  }

  buildStubProxy() {
    // TODO Update with parent selector
    if((this.createInfo.parent || this.createInfo.parent === '')  && this.createInfo.type) {
      // Create a stub item proxy since one does not yet exist
      this.itemProxy = {
        kind : this.createInfo.type.name,
        item: {
          parentId : this.createInfo.parent
        },
        model : this.createInfo.type.dataModelProxy
      }
      this.type= this.DynamicTypeService.getKoheseTypes()[this.itemProxy.kind];
      let modelProxy: ItemProxy = this.itemProxy.model;
      while (modelProxy) {
        let type: KoheseType = this.DynamicTypeService.
          getKoheseTypes()[modelProxy.item.name];
        for (let fieldName in type.dataModelFields) {
          this.itemProxy.item[fieldName] = type.dataModelFields[fieldName].
            default;
        }
        modelProxy = this.ItemRepository.getProxyFor(modelProxy.item.base);
      }
      this.updateProperties();
      this.formGroup = this.createFormGroup();
      this.formGroupUpdated.emit(this.formGroup);
    }
  }

  updateProperties () : void {
    this.properties = {};
    let fieldGroups: Array<any> = [{}];
    let fieldGroup: any = {};
    // Apply properties from my current class 
    console.log(':: Update Properties ');
    for (let fieldName in this.type.properties) {
      if (this.fieldFilter(fieldName)) {
        fieldGroup[fieldName] = this.type.properties[fieldName];
      }
    }
    fieldGroups.push(fieldGroup);
    console.log(':: Current Properties loaded');
    console.log(this.properties);

    console.log(':: Parent Properties');
    // Grab properties from my base class
    if (this.itemProxy) {
      let inheritedModel = this.itemProxy.model.item.base;
      while(inheritedModel != 'PersistedModel') {
        console.log('Properties of' + inheritedModel)
        let inheritedProxy = this.ItemRepository.getProxyFor(inheritedModel);
        let inheritedView = this.DynamicTypeService
                                .getViewProxyFor(inheritedProxy);
        if (inheritedView) {
          console.log(':: View found ');
          console.log(inheritedView);
          fieldGroup = {};
          for (let fieldName in inheritedView.item.viewProperties) {
            console.log(':: Adding inherited property ' + fieldName);
            fieldGroup[fieldName] = inheritedView.item.
              viewProperties[fieldName];
          }
          fieldGroups.push(fieldGroup);
        }
        inheritedModel = inheritedProxy.item.base;
      }
    }
    
    fieldGroups.reverse();
    for (let j: number = 0; j < fieldGroups.length; j++) {
      for (let fieldName in fieldGroups[j]) {
        this.properties[fieldName] = fieldGroups[j][fieldName];
      }
    }
    
    console.log(':: Update Properties Complete');
    console.log(this.properties);
  }

  createFormGroup () : FormGroup {
    const group = this.FormBuilder.group(this.buildPropertyMap(true));
    //this.config.forEach(control => group.addControl(control.name, this.FormBuilder.control()));
    if (this.disabled) {
      group.disable();
    }
    return group;
  }
  
  getFormGroup(): FormGroup {
    return this.formGroup;
  }
  
  buildPropertyMap(includeValidation: boolean): any {
    let propertyMap: any = {};
    for (let propertyKey in this.properties) {
      let currentProperty: any = this.properties[propertyKey];
      let defaultValue: any = (this.itemProxy ?
        this.itemProxy.item[propertyKey] : currentProperty.default);
      if (includeValidation && currentProperty.required) {
        propertyMap[propertyKey] = [defaultValue, Validators.required];
      } else {
        propertyMap[propertyKey] = defaultValue;
      }
    }
    return propertyMap;
  }
}
