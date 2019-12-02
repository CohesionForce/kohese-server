import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';

import { TableComponent } from './table.component';

@NgModule({
  declarations: [TableComponent],
  entryComponents: [TableComponent],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [TableComponent]
})
export class TableModule {
  public constructor() {
  }
}

