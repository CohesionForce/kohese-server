import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';

import { MaterialModule } from '../../material.module';
import { MarkdownEditorComponent } from './markdown-editor.component';

@NgModule({
  declarations: [MarkdownEditorComponent],
  exports: [MarkdownEditorComponent],
  imports: [
    FormsModule,
    MarkdownModule,
    MaterialModule
  ]
})
export class MarkdownEditorModule {
  public constructor() {
  }
}
