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

@NgModule({
  declarations: [
    DocumentConfigurationEditorComponent,
    FormatObjectEditorComponent,
    MultivaluedFieldComponent,
    SinglevaluedFieldComponent,
    FormatDefinitionEditorComponent
  ],
  entryComponents: [
    FormatObjectEditorComponent,
    DocumentConfigurationEditorComponent
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
