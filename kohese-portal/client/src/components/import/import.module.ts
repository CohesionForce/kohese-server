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


import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';

import { MaterialModule } from '../../material.module';
import { UserInputModule } from '../user-input/user-input.module';
import { TreeViewModule } from '../tree/tree.module';
import { ImportComponent } from './import.component';
import { ParameterSpecifierComponent } from './parameter-specifier/parameter-specifier.component';

@NgModule({
    declarations: [
        ImportComponent,
        ParameterSpecifierComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        MarkdownModule,
        MaterialModule,
        UserInputModule,
        TreeViewModule
    ]
})
export class ImportModule {
  public constructor() {
  }
}
