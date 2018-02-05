import { Input, Inject, Component, OnInit, OnDestroy, EventEmitter} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material';

import { NavigatableComponent } from '../../../classes/NavigationComponent.class'
import { NavigationService } from '../../../services/navigation/navigation.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { TypeProperty } from '../../../classes/UDT/TypeProperty.class';

@Component({
  templateUrl : './property-editor.component.html',
  selector : 'property-editor'
})
export class PropertyEditorComponent extends NavigatableComponent
                                     implements OnInit, OnDestroy  {
  /* Data */
  @Input()
  property : TypeProperty;
  /* UI Switches */
  saveEmitter : EventEmitter<TypeProperty>
  /* Subscriptions */

  /* Observables */

  /* Utilities */
  propertyForm : FormGroup;

  constructor (@Inject(MAT_DIALOG_DATA) public data : any,
               protected NavigationService : NavigationService,
               private typeService: DynamicTypesService,
               private FormBuilder : FormBuilder
               ) {
    super(NavigationService);
  }

  ngOnInit () {
    if(!this.data.property) {
      this.property = {
        inputType : '',
        required : false,
        default : '',
        propertyName : '',
        enum : undefined
      }
    } else {
        this.property = this.data.property;
    }

    this.saveEmitter = this.data.saveEmitter;

    this.propertyForm = this.createFormGroup();
  }

  ngOnDestroy () {
    this.saveEmitter.emit(this.property);

  }

  saveProperty () {
    this.saveEmitter.emit(this.property);
  }

  createFormGroup () : FormGroup {
    let formObject = {
      propertyName : [this.property.propertyName, Validators.required],
      inputType : [this.property.inputType, Validators.required],
    };
    formObject['default'] = (this.property.default) ? this.property.default :
                                                      '';
    const group = this.FormBuilder.group(formObject);
    //this.config.forEach(control => group.addControl(control.name, this.FormBuilder.control()));
    return group;
  }
}
