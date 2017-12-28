import { NgModule } from "@angular/core/";

import { ActionTableComponent } from './action-table.component';
import { CommonModule } from "@angular/common";


@NgModule({
  declarations: [
    ActionTableComponent
  ],
  imports : [
    CommonModule
  ],
  exports : [
    ActionTableComponent
  ]
})
export class ActionTableModule {}
