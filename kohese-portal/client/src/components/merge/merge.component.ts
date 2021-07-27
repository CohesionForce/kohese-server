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
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// NPM

// Kohese
import { TreeComponent } from '../tree/tree.component';

export enum VersionSelection {
  LOCAL = 'Local', REMOTE = 'Remote'
}

export class Difference {
  get element() {
    return this._element;
  }

  private _versionSelection: VersionSelection;
  get versionSelection() {
    return this._versionSelection;
  }
  set versionSelection(versionSelection: VersionSelection) {
    this._versionSelection = versionSelection;
  }

  get localValue() {
    return this._localValue;
  }

  get remoteValue() {
    return this._remoteValue;
  }

  get subDifferences() {
    return this._subDifferences;
  }

  public constructor(private _element: any, private _localValue: string,
    private _remoteValue: string, private _subDifferences: Array<Difference>) {
  }
}

@Component({
  selector: 'merge',
  templateUrl: './merge.component.html',
  styleUrls: ['./merge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MergeComponent implements OnInit {
  private _differences: Array<Difference>;
  get differences() {
    return this._differences;
  }
  @Input('differences')
  set differences(differences: Array<Difference>) {
    this._differences = differences;
  }

  private _getChildren: (element: any) => Array<any> = (element: any) => {
    let children: Array<any>;
    if (element === this._differences) {
      children = this._differences;
    } else {
      children = (element as Difference).subDifferences;
    }

    return children;
  };
  get getChildren() {
    return this._getChildren;
  }

  private _getText: (element: any) => string = (element: any) => {
    let difference: Difference = (element as Difference);
    return difference.element.toString() + (difference.versionSelection ?
      (' (' + difference.versionSelection + ')') : '');
  };
  get getText() {
    return this._getText;
  }

  private _selectedDifference: Difference;
  get selectedDifference() {
    return this._selectedDifference;
  }

  @ViewChild('differenceTree', {static: false}) 'differenceTree' !: ElementRef;
  private _differenceTree: TreeComponent;

  get matDialogRef() {
    return this._matDialogRef;
  }

  get VersionSelection() {
    return VersionSelection;
  }

  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef: MatDialogRef<MergeComponent>) {
  }

  public ngOnInit(): void {
    if (this.isDialogInstance()) {
      this._differences = this._data['differences'];
    }
  }

  public isDialogInstance(): boolean {
    return this._matDialogRef && (this._matDialogRef.componentInstance ===
      this) && this._data;
  }

  public selectVersionForAllDifferences(versionSelection: VersionSelection):
    void {
    let differenceStack: Array<Difference> = [...this._differences];
    while (differenceStack.length > 0) {
      let difference: Difference = differenceStack.pop();
      difference.versionSelection = versionSelection;
      differenceStack.push(...difference.subDifferences);
    }

    this._differenceTree.update(false);
    this._changeDetectorRef.markForCheck();
  }

  public differenceSelected(difference: Difference): void {
    this._selectedDifference = difference;
    this._changeDetectorRef.markForCheck();
  }

  public versionSelected(versionSelection: VersionSelection): void {
    this._selectedDifference.versionSelection = versionSelection;
    this._differenceTree.update(false);
    this._changeDetectorRef.markForCheck();
  }

  public canMerge(): boolean {
    let differenceStack: Array<Difference> = [...this._differences];
    while (differenceStack.length > 0) {
      let difference: Difference = differenceStack.pop();
      if (!difference.versionSelection) {
        return false;
      }

      differenceStack.push(...difference.subDifferences);
    }

    return true;
  }
}
