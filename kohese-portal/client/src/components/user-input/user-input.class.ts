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
import { Input, Directive } from '@angular/core';
import { FormGroup } from '@angular/forms';

// Other External Dependencies

// Kohese

@Directive()
export class UserInput {
  @Input()
  public formGroup: FormGroup;
  @Input()
  public fieldId: string;
  @Input()
  public fieldName: string;

  private _required: boolean = false;
  get required() {
    return this._required;
  }
  @Input('required')
  set required(required: boolean) {
    this._required = required;
  }

  constructor() {
  }
}
