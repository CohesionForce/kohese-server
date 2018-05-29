import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'navigator',
  templateUrl: './navigator.component.html',
  styleUrls: ['./navigator.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigatorComponent {
  public constructor() {
  }
  
  public refresh(index: number, ...tabComponents: Array<any>): void {
    setTimeout(() => {
      tabComponents[index].refresh();
    });
  }
}
