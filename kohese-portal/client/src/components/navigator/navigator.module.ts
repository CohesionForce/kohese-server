import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaterialModule } from '../../material.module';
import { PipesModule } from '../../pipes/pipes.module';
import { FilterModule } from '../filter/filter.module';
import { TreeViewModule } from '../tree/tree.module';
import { NavigatorComponent } from './navigator.component';

@NgModule({
  declarations: [NavigatorComponent],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    PipesModule,
    FilterModule,
    TreeViewModule
  ],
  exports: [NavigatorComponent]
})
export class NavigatorModule {
}