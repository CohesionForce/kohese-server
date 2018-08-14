import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AngularSplitModule } from 'angular-split';
import { VirtualScrollModule } from 'angular2-virtual-scroll';

import { MaterialModule } from '../../material.module';
import { PipesModule } from '../../pipes/pipes.module';
import { UserInputModule } from '../user-input/user-input.module';
import { DetailsModule } from '../details/details.module';
import { CompareItemsComponent } from './item-comparison/compare-items.component';
import { CommitComparisonComponent } from './commit-comparison/commit-comparison.component';
import { ComparisonSideComponent } from './item-comparison/comparison-side.component';

@NgModule({
  declarations: [
    CompareItemsComponent,
    CommitComparisonComponent,
    ComparisonSideComponent
  ],
  entryComponents: [
    CompareItemsComponent,
    CommitComparisonComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AngularSplitModule,
    VirtualScrollModule,
    MaterialModule,
    PipesModule,
    UserInputModule,
    DetailsModule
  ]
})
export class CompareItemsModule {
}