/*
 * Copyright (c) 2021 CohesionForce inc. | www.CohesionForce.com | info@CohesionForce.com
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
