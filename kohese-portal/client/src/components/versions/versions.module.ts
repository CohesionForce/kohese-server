import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularSplitModule } from 'angular-split';

import { TreeViewModule } from '../tree/tree.module';
import { VersionsComponent } from './versions.component';

@NgModule({
  declarations: [VersionsComponent],
  imports: [
    CommonModule,
    AngularSplitModule,
    TreeViewModule
  ]
})
export class VersionsModule {
}