import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AngularSplitModule } from 'angular-split';

import { MaterialModule } from '../../material.module';
import { PipesModule } from '../../pipes/pipes.module';
import { MarkdownEditorModule } from '../markdown-editor/markdown-editor.module';
import { TreeViewModule } from '../tree/tree.module';
import { ObjectEditorComponent } from './object-editor.component';
import { DocumentConfigurationEditorComponent } from './document-configuration/document-configuration-editor.component';

@NgModule({
  declarations: [
    ObjectEditorComponent,
    DocumentConfigurationEditorComponent
  ],
  entryComponents: [
    ObjectEditorComponent,
    DocumentConfigurationEditorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AngularSplitModule,
    MaterialModule,
    PipesModule,
    MarkdownEditorModule,
    TreeViewModule
  ],
  exports: [ObjectEditorComponent]
})
export class ObjectEditorModule {
  public constructor() {
  }
}
