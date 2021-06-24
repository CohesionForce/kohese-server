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


import { DocumentViewModule } from './../../document-view/document-view.module';
import { FormatPreviewComponent } from './format-preview/format-preview.component';
import { ContainerSelectorComponent } from './format-gui/container-selector/container-selector.component';
import { PipesModule } from '../../../pipes/pipes.module';
import { MaterialModule } from '../../../material.module';
import { UserInputModule } from '../../user-input/user-input.module';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TableEditorComponent } from './table-editor/table-editor.component';
import { TablePreviewDialogComponent } from './table-editor/table-preview-dialog/table-preview-dialog.component';

@NgModule({
  declarations: [
    ContainerSelectorComponent,
    FormatPreviewComponent,
    TableEditorComponent,
    TablePreviewDialogComponent
  ],
  entryComponents: [
    ContainerSelectorComponent,
    FormatPreviewComponent,
    TablePreviewDialogComponent
  ],
  exports : [
    TableEditorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    PipesModule,
    UserInputModule,
    DocumentViewModule
  ]
})
export class FormatModule {

}
