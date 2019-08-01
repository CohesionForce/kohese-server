import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { EditorModule } from '@tinymce/tinymce-angular';
import { AngularSplitModule } from 'angular-split';

import { MaterialModule } from '../../material.module';
import { TreeViewModule } from '../tree/tree.module';
import { TextEditorComponent } from './text-editor.component';
import { AttributeInsertionComponent } from './attribute-insertion/attribute-insertion.component';

@NgModule({
  declarations: [
    TextEditorComponent,
    AttributeInsertionComponent
  ],
  entryComponents: [
    TextEditorComponent,
    AttributeInsertionComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MarkdownModule,
    EditorModule,
    AngularSplitModule,
    MaterialModule,
    TreeViewModule
  ],
  exports: [TextEditorComponent]
})
export class TextEditorModule {
  public constructor() {
  }
}
