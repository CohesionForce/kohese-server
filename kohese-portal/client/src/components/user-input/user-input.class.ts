import { Inject, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

export class UserInput {
  @Input()
  public formGroup: FormGroup;
  @Input()
  public fieldId: string;
  @Input()
  public fieldName: string;
  
  constructor() {
  }
}