/*
 * Copyright (c) 2021 CohesionForce inc. | www.CohesionForce.com | info@CohesionForce.com
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


import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';

import { ItemBoardComponent } from './item-board.component';
import { DetailsModule } from '../details/details.module';
import { ObjectEditorModule } from '../object-editor/object-editor.module';
import { DirectivesModule } from '../../directives/directives.module'
@NgModule({
  declarations: [ItemBoardComponent],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    DetailsModule,
    ObjectEditorModule,
    DirectivesModule
  ],
  exports: [ItemBoardComponent]
})
export class ItemBoardModule {
  public constructor() {
  }
}
