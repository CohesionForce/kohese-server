import { NgModule } from "@angular/core/";
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { MaterialModule } from "../../material.module";
import { PipesModule } from "../../pipes/pipes.module";

import { ReportGeneratorComponent } from "./report-generator.component";


@NgModule({
  declarations: [
    ReportGeneratorComponent
  ],
  entryComponents: [
  ],
  imports : [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    PipesModule,
  ],
  exports : [
    ReportGeneratorComponent
  ]
})
export class ReportGeneratorModule {}
