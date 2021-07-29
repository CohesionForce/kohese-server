/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// Angular
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Other External Dependencies

// Kohese
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

    // Check to see if the comparison has been deferred
    if (comparison && comparison.propertyDiffPending) {
      // Since this detection may occur more than once, only request the detail diff
      // if it is not already in progess
      if(!comparison.propertyDiffInProgress){
        comparison.compareProperties().then(() => {
          this._changeDetectorRef.detectChanges();
        });
      }
    }
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

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef
  ) {
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
