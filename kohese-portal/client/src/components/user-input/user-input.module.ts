import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { KTextComponent } from './k-text/k-text.component';
import { KProxySelectorComponent } from './k-proxy-selector/k-proxy-selector.component';
import { KDateComponent } from './k-date/k-date.component';
import { KSelectComponent } from './k-select/k-select.component';
import { KStateEditorComponent } from './k-state-editor/k-state-editor.component';
import { KUserSelectorComponent } from './k-user-selector/k-user-selector.component';
import { KMarkdownComponent } from './k-markdown/k-markdown.component';

import { MarkdownModule } from 'ngx-markdown';
import { MarkdownCheatSheetComponent } from './k-markdown/markdown-cheat-sheet.component';

@NgModule({
  declarations: [
    KTextComponent,
    KProxySelectorComponent,
    KUserSelectorComponent,
    KDateComponent,
    KSelectComponent,
    KStateEditorComponent,
    KMarkdownComponent,
    MarkdownCheatSheetComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    MarkdownModule.forChild()
  ],
  exports: [
    KTextComponent,
    KProxySelectorComponent,
    KUserSelectorComponent,
    KDateComponent,
    KSelectComponent,
    KStateEditorComponent,
    KMarkdownComponent
  ],
  entryComponents: [
    MarkdownCheatSheetComponent
  ]
})
export class UserInputModule {}
