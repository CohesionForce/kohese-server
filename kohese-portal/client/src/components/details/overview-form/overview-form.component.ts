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
  public formGroup : FormGroup;
  @Input()
  public type : KoheseType;
  @Input()
  public itemProxy: ItemProxy;
  @Input()
  public disabled: boolean;
  @Input()
  public fieldFilter: ((fieldName: string) => boolean);
  public properties: any = {};

  private repoStatusSubscription : Subscription;

  constructor(protected NavigationService : NavigationService,
              private FormBuilder : FormBuilder,
              private typeService: DynamicTypesService,
              private ItemRepository : ItemRepository) {
    super(NavigationService);
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
          this.type = this.typeService.getKoheseTypes()[this.itemProxy.kind];
        }
        
        for (let fieldName in this.type.properties) {
          if (this.fieldFilter(fieldName)) {
            this.properties[fieldName] = this.type.properties[fieldName];
          }
        }
        
        this.formGroup = this.createFormGroup();
      }
    });
  }

  ngOnDestroy () {
    this.repoStatusSubscription.unsubscribe();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    let changedInputs: Array<string> = Object.keys(changes);
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
