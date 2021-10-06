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


import { NgModule } from "@angular/core/";
import { MarkdownModule } from 'ngx-markdown';

import { DetailsComponent } from './details.component';
import { HistoryTabComponent } from './history-tab/history-tab.component';
import { ChildrenTabComponent } from './children-tab/children-tab.component';
import { ChildrenTableComponent } from './children-tab/children-table/children-table.component';
import { JournalComponent } from './journal/journal.component';
import { ReferencesTabComponent } from './references-tab/references-tab.component';
import { ReferenceTableComponent } from './references-tab/reference-table/reference-table.component';

import { CommonModule } from '@angular/common';

import { MaterialModule } from "../../material.module";
import { TreeModule } from '@circlon/angular-tree-component';
import { DocumentViewModule } from "../document-view/document-view.module";
import { ActionTableModule } from "../action-table/action-table.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PipesModule } from "../../pipes/pipes.module";
import { UserInputModule } from '../user-input/user-input.module';
import { CompareItemsModule } from '../compare-items/compare-items.module';
import { TreeViewModule } from '../tree/tree.module';
import { MarkdownEditorModule } from '../markdown-editor/markdown-editor.module';
import { ObjectEditorModule } from '../object-editor/object-editor.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    DetailsComponent,
    HistoryTabComponent,
    ReferencesTabComponent,
    ReferenceTableComponent,
    ChildrenTabComponent,
    ChildrenTableComponent,
    JournalComponent
  ],
  entryComponents: [
    DetailsComponent
  ],
  imports : [
    CommonModule,
    MaterialModule,
    DocumentViewModule,
    ActionTableModule,
    FormsModule,
    ReactiveFormsModule,
    PipesModule,
    UserInputModule,
    TreeModule,
    MarkdownModule,
    CompareItemsModule,
    TreeViewModule,
    MarkdownEditorModule,
    ObjectEditorModule,
    DirectivesModule
  ],
  exports : [
    DetailsComponent,
    HistoryTabComponent,
    ChildrenTabComponent,
  ]
})
export class DetailsModule {}
