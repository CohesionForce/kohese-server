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
import { AngularSplitModule } from 'angular-split';
import { MarkdownModule } from 'ngx-markdown';

import { MaterialModule } from '../../material.module';
import { PipesModule } from '../../pipes/pipes.module';
import { MarkdownEditorModule } from '../markdown-editor/markdown-editor.module';
import { TreeViewModule } from '../tree/tree.module';
import { DocumentConfigurationEditorComponent } from './document-configuration/document-configuration-editor.component';
import { FormatObjectEditorComponent } from './format-object-editor/format-object-editor.component';
import { FormatDefinitionEditorComponent } from './format-definition-editor/format-definition-editor.component';
import { TableModule } from '../table/table.module';
import { MultivaluedFieldComponent } from './format-object-editor/field/multivalued-field/multivalued-field.component';
import { SinglevaluedFieldComponent } from './format-object-editor/field/singlevalued-field/singlevalued-field.component';
import { NamespaceEditorComponent } from './namespace-editor/namespace-editor.component';

@NgModule({
  declarations: [
    DocumentConfigurationEditorComponent,
    FormatObjectEditorComponent,
    MultivaluedFieldComponent,
    SinglevaluedFieldComponent,
    FormatDefinitionEditorComponent,
    NamespaceEditorComponent
  ],
  entryComponents: [
    FormatObjectEditorComponent,
    DocumentConfigurationEditorComponent,
    NamespaceEditorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AngularSplitModule,
    MarkdownModule.forChild(),
    MaterialModule,
    PipesModule,
    MarkdownEditorModule,
    TreeViewModule,
    TableModule
  ],
  exports: [
    FormatObjectEditorComponent,
    FormatDefinitionEditorComponent
  ]
})
export class ObjectEditorModule {
  public constructor() {
  }
}
