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
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


// Kohese
import { MarkdownEditorModule } from '../markdown-editor/markdown-editor.module';
import { SimpleDialogComponent } from './simple-dialog/simple-dialog.component';
import { InputDialogComponent } from './input-dialog/input-dialog.component';
import { DynamicComponentDirective, ComponentDialogComponent } from './component-dialog/component-dialog.component';
import { MaterialModule } from '../../material.module';

@NgModule({
  declarations: [
    SimpleDialogComponent,
    InputDialogComponent,
    DynamicComponentDirective,
    ComponentDialogComponent
  ],
  entryComponents: [
    SimpleDialogComponent,
    InputDialogComponent,
    ComponentDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    MarkdownEditorModule
  ]
})
export class DialogModule {
  public constructor() {
  }
}
