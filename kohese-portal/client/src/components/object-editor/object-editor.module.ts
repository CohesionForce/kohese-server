import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AngularSplitModule } from 'angular-split';
import { MarkdownModule } from 'ngx-markdown';

import { MaterialModule } from '../../material.module';
import { PipesModule } from '../../pipes/pipes.module';
import { MarkdownEditorModule } from '../markdown-editor/markdown-editor.module';
import { TreeViewModule } from '../tree/tree.module';
import { ObjectEditorComponent } from './object-editor.component';
import { DocumentConfigurationEditorComponent } from './document-configuration/document-configuration-editor.component';
import { FormatObjectEditorComponent } from './format-object-editor/format-object-editor.component';
import { TableModule } from '../table/table.module';

@NgModule({
  declarations: [
    ObjectEditorComponent,
    DocumentConfigurationEditorComponent,
    FormatObjectEditorComponent
  ],
  entryComponents: [
    ObjectEditorComponent,
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
    ObjectEditorComponent,
    FormatObjectEditorComponent
  ]
})
export class ObjectEditorModule {
  public constructor() {
  }
}
