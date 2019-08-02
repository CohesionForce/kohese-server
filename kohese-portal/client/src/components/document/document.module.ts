import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaterialModule } from '../../material.module';
import { TextEditorModule } from '../text-editor/text-editor.module';
import { TreeViewModule } from '../tree/tree.module';
import { DocumentComponent } from './document.component';

@NgModule({
  declarations: [DocumentComponent],
  entryComponents: [DocumentComponent],
  exports: [DocumentComponent],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    TextEditorModule,
    TreeViewModule
  ]
})
export class DocumentModule {
  public constructor() {
  }
}