import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { EditorModule } from '@tinymce/tinymce-angular';

import { MaterialModule } from '../../material.module';
import { TextEditorComponent } from './text-editor.component';

@NgModule({
  declarations: [
    TextEditorComponent
  ],
  entryComponents: [
    TextEditorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MarkdownModule,
    EditorModule,
    MaterialModule
  ],
  exports: [TextEditorComponent]
})
export class TextEditorModule {
  public constructor() {
  }
}
