import { NgModule } from "@angular/core/";

import { ActionTableComponent } from './action-table.component';
import { EditableCellComponent } from './editable-cell/editable-cell.component';

import { CommonModule } from "@angular/common";
import { MaterialModule } from "../../material.module";
import { PipesModule } from "../../pipes/pipes.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";


@NgModule({
  declarations: [
    ActionTableComponent,
    EditableCellComponent,
  ],
  imports : [
    CommonModule,
    MaterialModule,
    PipesModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports : [
    ActionTableComponent
  ]
})
export class ActionTableModule {}


// TODO Implement
