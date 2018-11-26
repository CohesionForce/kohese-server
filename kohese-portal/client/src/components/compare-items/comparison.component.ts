import { Component, ChangeDetectionStrategy,
  ChangeDetectorRef, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Comparison } from './comparison.class';

@Component({
  selector: 'comparison',
  templateUrl: './comparison.component.html',
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComparisonComponent {
  private _comparison: Comparison;
  get comparison() {
    return this._comparison;
  }
  @Input('comparison')
  set comparison(comparison: Comparison) {
    this._comparison = comparison;
  }
  
  private _showDifferencesOnlySubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(true);
  get showDifferencesOnlySubject() {
    return this._showDifferencesOnlySubject;
  }
  @Input('showDifferencesOnlySubject')
  set showDifferencesOnlySubject(showDifferencesOnlySubject:
    BehaviorSubject<boolean>) {
    this._showDifferencesOnlySubject = showDifferencesOnlySubject;
  }
  
  get Array() {
    return Array;
  }
  
  public constructor() {
  }
  
  public getChangeStyle(change: any): object {
    let style: object = {};
    if (change.added) {
      style = {
        'background-color': 'lightgreen',
        'color': 'darkgreen'
      };
    } else if (change.removed) {
      style = {
        'background-color': 'lightcoral',
        'color': 'darkred'
      };
    }
    
    return style;
  }
}