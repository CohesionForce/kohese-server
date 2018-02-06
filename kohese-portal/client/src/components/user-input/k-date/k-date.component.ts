import { Component } from '@angular/core';
import { UserInput } from '../user-input.class';

@Component({
  selector: 'k-date',
  templateUrl: './k-date.component.html'
})
export class KDateComponent extends UserInput {
  constructor() {
    super();
  }
}