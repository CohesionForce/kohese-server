import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaterialModule } from '../../material.module';
import { TextEditorModule } from '../text-editor/text-editor.module';
import { DocumentComponent } from './document.component';

@NgModule({
  declarations: [DocumentComponent],
  entryComponents: [DocumentComponent],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    TextEditorModule
  ]
})
export class DocumentModule {
  public constructor() {
  }
}