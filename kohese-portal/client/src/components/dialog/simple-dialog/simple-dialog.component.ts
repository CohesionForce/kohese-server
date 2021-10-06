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

// Other External Dependencies

// Kohese
import { Dialog } from '../Dialog.interface';

@Component({
  templateUrl: './simple-dialog.component.html',
  styleUrls: ['./simple-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleDialogComponent implements Dialog {
  private _title: string;
  get title() {
    return this._title;
  }
  @Input('title')
  set title(title: string) {
    this._title = title;
  }

  private _text: string;
  get text() {
    return this._text;
  }
  @Input('text')
  set text(text: string) {
    this._text = text;
  }

  public constructor(private _changeDetectorRef: ChangeDetectorRef) {
  }

  public close(accept: boolean): any {
    return accept;
  }
}
