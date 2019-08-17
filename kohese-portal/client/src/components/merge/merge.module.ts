import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularSplitModule } from 'angular-split';
import { MarkdownModule } from 'ngx-markdown';

import { MaterialModule } from '../../material.module';
import { TreeViewModule } from '../tree/tree.module';
import { MergeComponent } from './merge.component';

@NgModule({
  declarations: [MergeComponent],
  entryComponents: [MergeComponent],
  imports: [
    CommonModule,
    AngularSplitModule,
    MarkdownModule.forChild(),
    MaterialModule,
    TreeViewModule
  ]
})
export class MergeModule {
  public constructor() {
  }
}
