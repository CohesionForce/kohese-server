import { Component, Input } from '@angular/core';


@Component({
  selector: 'kind-icon',
  templateUrl : './kind-icon.component.html'
})
export class KindIconComponent {
  @Input()
  kind : string;

  constructor () {
  }
}
