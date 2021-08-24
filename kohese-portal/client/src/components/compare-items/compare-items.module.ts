/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AngularSplitModule } from 'angular-split';
import { VirtualScrollModule } from 'angular2-virtual-scroll';

import { MaterialModule } from '../../material.module';
import { PipesModule } from '../../pipes/pipes.module';
import { UserInputModule } from '../user-input/user-input.module';
import { CompareItemsComponent } from './item-comparison/compare-items.component';
import { CommitComparisonComponent } from './commit-comparison/commit-comparison.component';
import { ChangeSummaryComponent } from './change-summary/change-summary.component';
import { ComparisonComponent } from './comparison.component';

@NgModule({
  declarations: [
    CompareItemsComponent,
    CommitComparisonComponent,
    ChangeSummaryComponent,
    ComparisonComponent
  ],
  entryComponents: [
    CompareItemsComponent,
    CommitComparisonComponent
  ],
  exports: [
    ChangeSummaryComponent,
    ComparisonComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AngularSplitModule.forRoot(),
    VirtualScrollModule,
    MaterialModule,
    PipesModule,
    UserInputModule
  ]
})
export class CompareItemsModule {
}
