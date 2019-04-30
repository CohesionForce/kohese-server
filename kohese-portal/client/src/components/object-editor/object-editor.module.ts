import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';

import { MaterialModule } from '../../material.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ObjectEditorComponent } from './object-editor.component';

@NgModule({
  declarations: [ObjectEditorComponent],
  entryComponents: [ObjectEditorComponent],
  imports: [
    CommonModule,
    FormsModule,
    MarkdownModule,
    MaterialModule,
    PipesModule
  ],
  exports: [ObjectEditorComponent]
})
export class ObjectEditorModule {
  public constructor() {
  }
}
