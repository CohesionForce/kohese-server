import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { MarkdownModule } from 'ngx-markdown';

import { MaterialModule } from '../../material.module';
import { MarkdownEditorComponent } from './markdown-editor.component';

@NgModule({
  declarations: [MarkdownEditorComponent],
  exports: [MarkdownEditorComponent],
  imports: [
    FormsModule,
    CommonModule,
    BrowserModule,
    MarkdownModule,
    MaterialModule
  ]
})
export class MarkdownEditorModule {
  public constructor() {
  }
}
