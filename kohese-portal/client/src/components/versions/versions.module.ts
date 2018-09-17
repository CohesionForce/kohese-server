import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularSplitModule } from 'angular-split';

import { LensModule } from '../lens/lens.module';
import { TreeViewModule } from '../tree/tree.module';
import { CompareItemsModule } from '../compare-items/compare-items.module';
import { VersionsComponent } from './versions.component';

@NgModule({
  declarations: [VersionsComponent],
  imports: [
    CommonModule,
    AngularSplitModule,
    LensModule,
    TreeViewModule,
    CompareItemsModule
  ]
})
export class VersionsModule {
}