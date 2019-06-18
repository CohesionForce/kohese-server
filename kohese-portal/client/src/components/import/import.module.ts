import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';

import { MaterialModule } from '../../material.module';
import { UserInputModule } from '../user-input/user-input.module';
import { TreeViewModule } from '../tree/tree.module';
import { ImportComponent } from './import.component';
import { PdfImportComponent } from './pdf/pdf-import.component';

@NgModule({
  declarations: [
    ImportComponent,
    PdfImportComponent
  ],
  entryComponents: [
    ImportComponent,
    PdfImportComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MarkdownModule,
    MaterialModule,
    UserInputModule,
    TreeViewModule
  ]
})
export class ImportModule {
  public constructor() {
  }
}
