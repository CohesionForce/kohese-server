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


import { NgModule } from "@angular/core/";
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { CreateWizardComponent } from './create-wizard.component';
import { MaterialModule } from "../../material.module";
import { PipesModule } from "../../pipes/pipes.module";
import { ObjectEditorModule } from '../object-editor/object-editor.module';

import { UserInputModule } from "../user-input/user-input.module";


@NgModule({
  declarations: [
    CreateWizardComponent
  ],
  entryComponents: [
    CreateWizardComponent
  ],
  imports : [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    PipesModule,
    ObjectEditorModule,
    BrowserAnimationsModule,
    UserInputModule

  ],
  exports : [
    CreateWizardComponent,
    UserInputModule
  ]
})
export class CreateWizardModule {}
