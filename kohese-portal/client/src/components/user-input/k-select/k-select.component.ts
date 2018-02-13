import { Component, Input } from '@angular/core';
import { UserInput } from '../user-input.class';

@Component({
  selector: 'k-select',
  templateUrl: './k-select.component.html'
})
export class KSelectComponent extends UserInput {
  @Input()
  options : Array<object>;

  constructor() {
    super();
    // TODO - Determine how to pass in dynamic data to dynamic components 
    }
  }