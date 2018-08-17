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
import { ProxySelectorComponent } from './k-proxy-selector/proxy-selector/proxy-selector.component';
import { TreeModule } from 'angular-tree-component';
import { PipesModule } from '../../pipes/pipes.module';
import { ProxySelectorDialogComponent } from './k-proxy-selector/proxy-selector-dialog/proxy-selector-dialog.component';
import { KdProxySelectorComponent } from './k-proxy-selector/kd-proxy-selector/kd-proxy-selector.component';

@NgModule({
  declarations: [
    KTextComponent,
    KProxySelectorComponent,
    KdProxySelectorComponent,
    KUserSelectorComponent,
    KDateComponent,
    KSelectComponent,
    KStateEditorComponent,
    KMarkdownComponent,
    MarkdownCheatSheetComponent,
    ProxySelectorComponent,
    ProxySelectorDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    MarkdownModule.forChild(),
    TreeModule,
    PipesModule
  ],
  exports: [
    KTextComponent,
    KProxySelectorComponent,
    KUserSelectorComponent,
    KDateComponent,
    KSelectComponent,
    KStateEditorComponent,
    KMarkdownComponent,
    ProxySelectorComponent,
    KdProxySelectorComponent
  ],
  entryComponents: [
    MarkdownCheatSheetComponent,
    ProxySelectorDialogComponent
  ]
})
export class UserInputModule {}
