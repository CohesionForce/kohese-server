import { NgModule } from "@angular/core/";
import { MarkdownModule } from 'ngx-markdown';

import { DetailsComponent } from './details.component';
import { HistoryTabComponent } from './history-tab/history-tab.component';
import { ChildrenTabComponent } from './children-tab/children-tab.component';
import { ProxySelectorTreeComponent } from './children-tab/proxy-selector-tree/proxy-selector-tree.component';
import { ChildrenTableComponent } from './children-tab/children-table/children-table.component';
import { JournalComponent } from './journal/journal.component';
import { DetailsFormComponent } from './details-form/details-form.component';
import { ReferencesTabComponent } from './references-tab/references-tab.component';
import { ReferenceTableComponent } from './references-tab/reference-table/reference-table.component';

import { CommonModule } from '@angular/common';

import { MaterialModule } from "../../material.module";
import { TreeModule } from 'angular-tree-component';
import { DocumentViewModule } from "../document-view/document-view.module";
import { ActionTableModule } from "../action-table/action-table.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PipesModule } from "../../pipes/pipes.module";
import { UserInputModule } from '../user-input/user-input.module';
import { DetailsDialogComponent } from "./details-dialog/details-dialog.component";
import { TextEditorModule } from '../text-editor/text-editor.module';
import { CompareItemsModule } from '../compare-items/compare-items.module';
import { TreeViewModule } from '../tree/tree.module';
import { MarkdownEditorModule } from '../markdown-editor/markdown-editor.module';
import { ObjectEditorModule } from '../object-editor/object-editor.module';

@NgModule({
  declarations: [
    DetailsComponent,
    HistoryTabComponent,
    ReferencesTabComponent,
    ReferenceTableComponent,
    ChildrenTabComponent,
    ChildrenTableComponent,
    ProxySelectorTreeComponent,
    JournalComponent,
    DetailsFormComponent,
    DetailsDialogComponent
  ],
  entryComponents: [
    DetailsDialogComponent
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
    TreeModule.forRoot(),
    MarkdownModule,
    TextEditorModule,
    CompareItemsModule,
    TreeViewModule,
    MarkdownEditorModule,
    ObjectEditorModule
  ],
  exports : [
    DetailsComponent,
    HistoryTabComponent,
    ChildrenTabComponent,
    DetailsFormComponent,
    ProxySelectorTreeComponent,
    DetailsDialogComponent
  ]
})
export class DetailsModule {}
