import { Component } from '@angular/core';
import { UserInput } from './user-input.class';

@Component({
  selector: 'date-user-input',
  templateUrl: './date-user-input.component.html'
})
export class DateUserInputComponent extends UserInput {
  constructor() {
    super();
  }
}