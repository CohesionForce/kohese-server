import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaterialModule } from '../../material.module';
import { PipesModule } from '../../pipes/pipes.module';
import { MarkdownEditorModule } from '../markdown-editor/markdown-editor.module';
import { ObjectEditorComponent } from './object-editor.component';

@NgModule({
  declarations: [ObjectEditorComponent],
  entryComponents: [ObjectEditorComponent],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    PipesModule,
    MarkdownEditorModule
  ],
  exports: [ObjectEditorComponent]
})
export class ObjectEditorModule {
  public constructor() {
  }
}
