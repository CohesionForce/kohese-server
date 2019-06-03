import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../../material.module';
import { ReportsComponent } from './reports.component';

@NgModule({
  declarations: [ReportsComponent],
  exports: [ReportsComponent],
  imports: [
    CommonModule,
    MaterialModule
  ]
})
export class ReportsModule {
  public constructor() {
  }
}
