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


import { NgModule } from "@angular/core";

import { ActionTableComponent } from './action-table.component';
import { EditableCellComponent } from './editable-cell/editable-cell.component';

import { CommonModule } from "@angular/common";
import { MaterialModule } from "../../material.module";
import { PipesModule } from "../../pipes/pipes.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";


@NgModule({
  declarations: [
    ActionTableComponent,
    EditableCellComponent,
  ],
  imports : [
    CommonModule,
    MaterialModule,
    PipesModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports : [
    ActionTableComponent
  ]
})
export class ActionTableModule {}


// TODO Implement
