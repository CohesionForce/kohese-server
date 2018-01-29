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

  constructor (@Inject(MAT_DIALOG_DATA) public data : any,
               public dialogRef: MatDialogRef<PropertyEditorComponent>,
               protected NavigationService : NavigationService
               ) {
    super(NavigationService);
  }

  ngOnInit () {
    if(!this.data.property) {
      this.property = {
        type : 'text',
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


}
