import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaterialModule } from '../../material.module';
import { PipesModule } from '../../pipes/pipes.module';
import { TreeViewModule } from '../tree/tree.module';
import { FilterComponent } from './filter.component';

@NgModule({
  declarations: [
    FilterComponent
  ],
  entryComponents: [FilterComponent],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    PipesModule,
    TreeViewModule
  ]
})
export class FilterModule {
}