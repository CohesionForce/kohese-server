import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AngularSplitModule } from 'angular-split';
import { MarkdownModule } from 'ngx-markdown';

import { MaterialModule } from '../../material.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ReportsComponent } from './reports.component';
import { ReportSpecificationComponent } from './report-specification/report-specification.component';
import { TreeViewModule } from '../tree/tree.module';

@NgModule({
  declarations: [
    ReportsComponent,
    ReportSpecificationComponent
  ],
  entryComponents: [ReportSpecificationComponent],
  exports: [ReportsComponent],
  imports: [
    CommonModule,
    FormsModule,
    AngularSplitModule,
    MarkdownModule.forChild(),
    MaterialModule,
    PipesModule,
    TreeViewModule
  ]
})
export class ReportsModule {
  public constructor() {
  }
}
