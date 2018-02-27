import { Component } from '@angular/core';
import { UserInput } from '../user-input.class';

@Component({
  selector: 'k-date',
  templateUrl: './k-date.component.html',
  styleUrls: ['./k-date.component.scss']
})
export class KDateComponent extends UserInput {
  constructor() {
    super();
  }
}