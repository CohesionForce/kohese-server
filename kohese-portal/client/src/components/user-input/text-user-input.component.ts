import { Component, Input } from '@angular/core';
import { UserInput } from './user-input.class';

@Component({
  selector: 'text-user-input',
  templateUrl: './text-user-input.component.html'
})
export class TextUserInputComponent extends UserInput {
  @Input()
  public isMultiLine: boolean;
  
  constructor() {
    super();
  }
}