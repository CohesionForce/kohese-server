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
import { Component, Optional, Inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';

// Other External Dependencies

// Kohese
import { Filter, FilterCriteriaConnection } from './filter.class';

@Component({
  selector: 'filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterComponent implements OnInit {
  get data() {
    return this._data;
  }

  private _filterSubject: BehaviorSubject<Filter>;
  get filterSubject() {
    return this._filterSubject;
  }

  public constructor(@Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    private _changeDetectorRef: ChangeDetectorRef) {
  }

  public ngOnInit(): void {
    let filter: Filter;
    if (this._data) {
      filter = this._data.filter;
    }

    if (!filter) {
      filter = new Filter();
    }

    this._filterSubject = new BehaviorSubject<Filter>(filter);
  }

  public isCriterionDefined(): boolean {
    let criterionFound: boolean = false;
    let elementStack: Array<FilterCriteriaConnection> = [this._filterSubject.
      getValue().rootElement];
    while (elementStack.length > 0) {
      let connection: FilterCriteriaConnection = elementStack.pop();
      if (connection.criteria.length > 0) {
        criterionFound = true;
        break;
      } else {
        elementStack.push(...connection.connections);
      }
    }

    return criterionFound;
  }
}
