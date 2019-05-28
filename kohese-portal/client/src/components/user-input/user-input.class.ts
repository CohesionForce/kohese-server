import { Inject, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

export class UserInput {
  @Input()
  public formGroup: FormGroup;
  @Input()
  public fieldId: string;
  @Input()
  public fieldName: string;
  
  private _required: boolean = false;
  get required() {
    return this._required;
  }
  @Input('required')
  set required(required: boolean) {
    this._required = required;
  }
  
  constructor() {
  }
}