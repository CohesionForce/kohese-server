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

export class CopySpecifications {
  private _nameOrSuffix: string = ' - Copy';
  get nameOrSuffix() {
    return this._nameOrSuffix;
  }
  set nameOrSuffix(nameOrSuffix: string) {
    this._nameOrSuffix = nameOrSuffix;
  }

  private _appendToOriginalName: boolean = true;
  get appendToOriginalName() {
    return this._appendToOriginalName;
  }
  set appendToOriginalName(appendToOriginalName: boolean) {
    this._appendToOriginalName = appendToOriginalName;
  }

  private _copyDescendants: boolean = false;
  get copyDescendants() {
    return this._copyDescendants;
  }
  set copyDescendants(copyDescendants: boolean) {
    this._copyDescendants = copyDescendants;
  }

  private _clearNonNameAttributes: boolean = false;
  get clearNonNameAttributes() {
    return this._clearNonNameAttributes;
  }
  set clearNonNameAttributes(clearNonNameAttributes: boolean) {
    this._clearNonNameAttributes = clearNonNameAttributes;
  }

  private _addToDocument: boolean = true;
  get addToDocument() {
    return this._addToDocument;
  }
  set addToDocument(addToDocument: boolean) {
    this._addToDocument = addToDocument;
  }

  public constructor() {
  }
}

@Component({
  selector: 'copy',
  templateUrl: './copy.component.html',
  styleUrls: ['./copy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CopyComponent implements OnInit {
  private _copySpecifications: CopySpecifications = new CopySpecifications();
  get copySpecifications() {
    return this._copySpecifications;
  }

  private _allowDocumentAdditionSpecification: boolean = false;
  get allowDocumentAdditionSpecification() {
    return this._allowDocumentAdditionSpecification;
  }
  @Input('allowDocumentAdditionSpecification')
  set allowDocumentAdditionSpecification(allowDocumentAdditionSpecification:
    boolean) {
    this._allowDocumentAdditionSpecification =
      allowDocumentAdditionSpecification;
  }

  get matDialogRef() {
    return this._matDialogRef;
  }

  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef: MatDialogRef<CopyComponent>) {
  }

  public isDialogInstance(): boolean {
    return this._matDialogRef && (this._matDialogRef.componentInstance ===
      this) && this._data;
  }

  public ngOnInit(): void {
    if (this.isDialogInstance()) {
      this._allowDocumentAdditionSpecification = this._data[
        'allowDocumentAdditionSpecification'];
    }
  }
}
