import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { NavigatableComponent } from '../../../classes/NavigationComponent.class'
import { NavigationService } from '../../../services/navigation/navigation.service';
import { TabService } from '../../../services/tab/tab.service';

import { ItemProxy } from '../../../../../common/models/item-proxy.js';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';

@Component({
  selector: 'overview-form',
  templateUrl : './overview-form.component.html'
})

export class OverviewFormComponent extends NavigatableComponent
                                  implements OnInit, OnDestroy{
  formGroup : FormGroup;

  @Input()
  itemProxy : ItemProxy

  constructor(protected NavigationService : NavigationService,
              protected TabService : TabService,
              private FormBuilder : FormBuilder,
              private DynamicTypesService : DynamicTypesService) {
    super(NavigationService, TabService);

  }

  ngOnInit () {
    this.formGroup = this.createFormGroup();
  }

  ngOnDestroy () {

  }

  createFormGroup () : FormGroup {
    const group = this.FormBuilder.group({
      name: ['', Validators.required],
      description: ['']
    });
    //this.config.forEach(control => group.addControl(control.name, this.FormBuilder.control()));
    return group;
  }
}
