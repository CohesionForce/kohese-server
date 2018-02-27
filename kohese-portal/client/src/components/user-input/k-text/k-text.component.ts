import { Component, Input } from '@angular/core';
import { UserInput } from '../user-input.class';

@Component({
  selector: 'k-text',
  templateUrl: './k-text.component.html',
  styleUrls: ['./k-text.component.scss']
})
export class KTextComponent extends UserInput {
  @Input()
  public isMultiLine: boolean;
  
  constructor() {
    super();
  }
}