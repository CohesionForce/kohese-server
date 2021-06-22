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


import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'parameter-specifier',
  templateUrl: './parameter-specifier.component.html',
  styleUrls: ['./parameter-specifier.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParameterSpecifierComponent implements OnInit {
  private _parameters: any;
  get parameters() {
    return this._parameters;
  }
  @Input('parameters')
  set parameters(parameters: any) {
    this._parameters = parameters;
  }

  get matDialogRef() {
    return this._matDialogRef;
  }

  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef:
    MatDialogRef<ParameterSpecifierComponent>) {
  }

  public ngOnInit(): void {
    if (this.isDialogInstance()) {
      this._parameters = this._data['parameters'];
    }
  }

  public isDialogInstance(): boolean {
    return this._matDialogRef && (this._matDialogRef.componentInstance ===
      this) && this._data;
  }
}
