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
import { ReportSpecificationComponent } from './report-specification/report-specification.component';

@NgModule({
  declarations: [
    TextEditorComponent,
    AttributeInsertionComponent,
    ReportSpecificationComponent
  ],
  entryComponents: [
    TextEditorComponent,
    AttributeInsertionComponent,
    ReportSpecificationComponent
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
