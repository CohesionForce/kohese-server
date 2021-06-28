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
import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Title } from '@angular/platform-browser';

// NPM
import { BehaviorSubject } from 'rxjs';

// Kohese
import { Commit } from '../tree/commit-tree/commit-tree.component';
import { Comparison } from '../compare-items/comparison.class';

@Component({
  selector: 'versions',
  templateUrl: './versions.component.html',
  styleUrls: ['./versions.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class VersionsComponent {
  private _selectedVersionObject: any;
  get selectedVersionObject() {
    return this._selectedVersionObject;
  }

  private _comparisonsSubject: BehaviorSubject<Array<Comparison>> = new BehaviorSubject<Array<Comparison>>([]);
  get comparisonsSubject() {
    return this._comparisonsSubject;
  }

  private _showDifferencesOnlySubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  get showDifferencesOnlySubject() {
    return this._showDifferencesOnlySubject;
  }

  public constructor(
    private title : Title,
    private _changeDetectorRef: ChangeDetectorRef
    ) {
      this.title.setTitle("Versions");
    }

  public commitTreeRowSelected(object: any): void {
    this._selectedVersionObject = object;
  }

  public getSelectionType(): string {
    let type: string = '';
    if (this._selectedVersionObject instanceof Commit) {
      type = 'Commit';
      this._comparisonsSubject.next(this._selectedVersionObject.comparisons);
    } else if (this._selectedVersionObject instanceof Comparison) {
      type = 'Comparison';
    }

    return type;
  }

  public toggleShowingDifferencesOnly(): void {
    this._showDifferencesOnlySubject.next(!this._showDifferencesOnlySubject.getValue());
    this._changeDetectorRef.markForCheck();
  }
}
