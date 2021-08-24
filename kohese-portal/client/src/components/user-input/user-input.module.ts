/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import { ExpandedRowColumnComponent } from './k-proxy-selector/proxy-table/expanded-row-column/expanded-row-column.component';
import { ProxyTableComponent } from './k-proxy-selector/proxy-table/proxy-table.component';
import { KTableComponent } from './k-table/k-table.component';
import { KdMarkdownComponent } from './k-markdown/kd-markdown/kd-markdown.component';
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
import { TreeModule } from '@circlon/angular-tree-component';
import { PipesModule } from '../../pipes/pipes.module';
import { ProxySelectorDialogComponent } from './k-proxy-selector/proxy-selector-dialog/proxy-selector-dialog.component';
import { KdProxySelectorComponent } from './k-proxy-selector/kd-proxy-selector/kd-proxy-selector.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
    ProxySelectorDialogComponent,
    KdMarkdownComponent,
    KTableComponent,
    ProxyTableComponent,
    ExpandedRowColumnComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    MarkdownModule.forChild(),
    TreeModule,
    PipesModule,
    BrowserAnimationsModule
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
    KdProxySelectorComponent,
    KdMarkdownComponent,
    KTableComponent,
    ProxyTableComponent,
    ExpandedRowColumnComponent
  ],
  entryComponents: [
    MarkdownCheatSheetComponent,
    ProxySelectorDialogComponent,
    ProxyTableComponent
  ]
})
export class UserInputModule {}
