import { Component, Input, OnInit, OnDestroy, OnChanges,
  SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators,
  AbstractControl } from '@angular/forms';

import { NavigatableComponent } from '../../../classes/NavigationComponent.class'
import { NavigationService } from '../../../services/navigation/navigation.service';

import { ItemProxy } from '../../../../../common/models/item-proxy.js';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'overview-form',
  templateUrl : './overview-form.component.html'
})

export class OverviewFormComponent extends NavigatableComponent
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
  public properties: any = {};
  private initialized : boolean;

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
      if (update.connected) {
        if (!this.type) {
          this.type = this.DynamicTypeService.getKoheseTypes()[this.itemProxy.kind];
        }
        this.updateProperties();      
        this.formGroup = this.createFormGroup();
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
      console.log(changedInputs);

      if(changes['itemProxy']) {
        this.itemProxy = changes['itemProxy'].currentValue;
        this.type = this.DynamicTypeService.getKoheseTypes()[this.itemProxy.kind];
        this.updateProperties();
        this.createFormGroup();
      }

      if(changes['type']) {
        this.type = this.DynamicTypeService.getKoheseTypes()[changes['type'].currentValue]
      }

      if (-1 !== changedInputs.indexOf('disabled')) {
        if (this.formGroup) {
          if (changes['disabled'].currentValue) {
            this.formGroup.disable();
          } else {
            this.formGroup.enable();
          }
        }
      }
    }
  }

  updateProperties () : void {
    // Apply properties from my current class 
    console.log(':: Update Properties ');
    for (let fieldName in this.type.properties) {
      if (this.fieldFilter(fieldName)) {
        this.properties[fieldName] = this.type.properties[fieldName];
      }
    }
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
          for (let fieldName in inheritedView.item.viewProperties) {
            console.log(':: Adding inherited property ' + fieldName);
            this.properties[fieldName] = inheritedView.item.viewProperties[fieldName];
          }
        }
        inheritedModel = inheritedProxy.item.base;
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
