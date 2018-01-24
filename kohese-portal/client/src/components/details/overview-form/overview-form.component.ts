import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { NavigatableComponent } from '../../../classes/NavigationComponent.class'
import { NavigationService } from '../../../services/navigation/navigation.service';
import { TabService } from '../../../services/tab/tab.service';

import { ItemProxy } from '../../../../../common/models/item-proxy.js';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'overview-form',
  templateUrl : './overview-form.component.html'
})

export class OverviewFormComponent extends NavigatableComponent
                                  implements OnInit, OnDestroy{
  formGroup : FormGroup;
  koheseTypes : object;
  currentTypeName : string;
  currentType : KoheseType


  @Input()
  itemProxy : ItemProxy;

  repoStatusSubscription : Subscription;

  constructor(protected NavigationService : NavigationService,
              protected TabService : TabService,
              private FormBuilder : FormBuilder,
              private DynamicTypesService : DynamicTypesService,
              private ItemRepository : ItemRepository) {
    super(NavigationService, TabService);

  }

  ngOnInit () {
    this.repoStatusSubscription = this.ItemRepository.getRepoStatusSubject()
    .subscribe((update) => {
      console.log(update);
      if (update.connected) {
        this.koheseTypes = this.DynamicTypesService.getKoheseTypes();
        this.currentTypeName = 'Item';
        this.currentType = this.koheseTypes[this.currentTypeName];
        console.log(this.koheseTypes);
        this.formGroup = this.createFormGroup();
        }
      })
  }

  ngOnDestroy () {
    this.repoStatusSubscription.unsubscribe();
  }

  createFormGroup () : FormGroup {
    let formObject = {};
    for (let i : number = 0; i < this.currentType.properties.length; i ++ ) {
      let currentProperty = this.currentType.properties[i]
      if (currentProperty.required) {
        formObject[currentProperty.propertyName] = [currentProperty.default, Validators.required]
      } else {
        formObject[currentProperty.propertyName] = currentProperty.default;
      }
    }
    const group = this.FormBuilder.group(formObject);
    //this.config.forEach(control => group.addControl(control.name, this.FormBuilder.control()));
    return group;
  }
}
