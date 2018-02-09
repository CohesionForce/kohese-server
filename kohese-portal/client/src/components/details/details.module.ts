import { NgModule } from "@angular/core/";
import { DetailsComponent } from './details.component';
import { HistoryTabComponent } from './history-tab/history-tab.component';
import { ChildrenTabComponent } from './children-tab/children-tab.component';
import { ChildrenTreeComponent } from './children-tab/children-tree/children-tree.component';
import { ChildrenTableComponent } from './children-tab/children-table/children-table.component';
import { OverviewFormComponent } from './overview-form/overview-form.component';
import { JournalComponent } from './journal/journal.component';
import { JournalEntryComponent } from './journal/journal-entry/journal-entry.component';

import { CommonModule } from '@angular/common';

import { MaterialModule } from "../../material.module";
import { DragulaModule } from 'ng2-dragula';
import { TreeModule } from 'angular-tree-component';
import { DocumentViewModule } from "../document-view/document-view.module";
import { ActionTableModule } from "../action-table/action-table.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PipesModule } from "../../pipes/pipes.module";
import { UserInputModule } from '../user-input/user-input.module';


@NgModule({
  declarations: [
    DetailsComponent,
    HistoryTabComponent,
    ChildrenTabComponent,
    ChildrenTableComponent,
    ChildrenTreeComponent,
    OverviewFormComponent,
    JournalComponent,
    JournalEntryComponent
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
    DragulaModule
  ],
  exports : [
    DetailsComponent,
    HistoryTabComponent,
    ChildrenTabComponent,
    OverviewFormComponent
  ]
})
export class DetailsModule {}
