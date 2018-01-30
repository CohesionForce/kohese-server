import { Input, Inject, Component, OnInit, OnDestroy, EventEmitter} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { NavigatableComponent } from '../../../classes/NavigationComponent.class'
import { NavigationService } from '../../../services/navigation/navigation.service';
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
  templateInput : string;
  /* UI Switches */
  saveEmitter : EventEmitter<TypeProperty>
  /* Subscriptions */

  /* Observables */

  /* Utilities */
  propertyForm : FormGroup;

  constructor (@Inject(MAT_DIALOG_DATA) public data : any,
               public dialogRef: MatDialogRef<PropertyEditorComponent>,
               protected NavigationService : NavigationService,
               private FormBuilder : FormBuilder
               ) {
    super(NavigationService);
  }

  ngOnInit () {
    if(!this.data.property) {
      this.property = {
        inputType : 'text',
        template : '',
        required : false,
        default : '',
        propertyName : '',
        enum : undefined
      }
    } else {
        this.property = this.data.property;
    }

    this.saveEmitter = this.data.saveEmitter;

    this.templateInput = this.property.template;
    this.propertyForm = this.createFormGroup();
    console.log(this);
  }

  ngOnDestroy () {
    this.property.template = this.templateInput
    this.saveEmitter.emit(this.property);

  }

  renderHtml () {
    this.property.template = this.templateInput;
  }

  saveProperty () {
    this.saveEmitter.emit(this.property);
  }

  close () {
    this.dialogRef.close();
  }

  createFormGroup () : FormGroup {
    let formObject = {
      propertyName : [this.property.propertyName, Validators.required],
      template : [this.property.template, Validators.required],
      inputType : [this.property.inputType, Validators.required],
    };
    formObject['default'] = (this.property.default) ? this.property.default :
                                                      '';
    const group = this.FormBuilder.group(formObject);
    //this.config.forEach(control => group.addControl(control.name, this.FormBuilder.control()));
    return group;
  }


}
