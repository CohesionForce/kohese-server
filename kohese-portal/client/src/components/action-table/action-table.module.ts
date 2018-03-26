import { NgModule } from "@angular/core/";

import { ActionTableComponent } from './action-table.component';
import { CommonModule } from "@angular/common";
import { MaterialModule } from "../../material.module";
import { PipesModule } from "../../pipes/pipes.module";


@NgModule({
  declarations: [
    ActionTableComponent
  ],
  imports : [
    CommonModule,
    MaterialModule,
    PipesModule
  ],
  exports : [
    ActionTableComponent
  ]
})
export class ActionTableModule {}


// TODO Implement
