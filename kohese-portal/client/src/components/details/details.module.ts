import { NgModule } from "@angular/core/";
import { DetailsComponent } from './details.component';
import { HistoryTabComponent } from './history-tab/history-tab.component';
import { ChildrenTabComponent } from './children-tab/children-tab.component';
import { OverviewFormComponent } from './overview-form/overview-form.component';

import { CommonModule } from '@angular/common';

import { MaterialModule } from "../../material.module";
import { DocumentViewModule } from "../document-view/document-view.module";
import { ActionTableModule } from "../action-table/action-table.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";


@NgModule({
  declarations: [
    DetailsComponent,
    HistoryTabComponent,
    ChildrenTabComponent,
    OverviewFormComponent
  ],
  imports : [
    CommonModule,
    MaterialModule,
    DocumentViewModule,
    ActionTableModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports : [
    DetailsComponent,
    HistoryTabComponent,
    ChildrenTabComponent
  ]
})
export class DetailsModule {}
