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


import { NgModule } from "@angular/core/";
import { CommonModule } from '@angular/common';
import { MaterialModule } from "../../material.module";

import { AngularSplitModule} from 'angular-split';

import { ServicesModule } from '../../services/services.module';
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommitBrowserComponent } from './commit-browser/commit-browser.component';
import { HistoryLensComponent } from './history-lens/history-lens.component';
import { LensComponent } from './lens.component';

import { TreeViewModule } from "../tree/tree.module";
import { DetailsModule } from "../details/details.module";
import { PipesModule } from "../../pipes/pipes.module";


@NgModule({
  declarations: [
    CommitBrowserComponent,
    HistoryLensComponent,
    LensComponent

  ],
  entryComponents: [
    CommitBrowserComponent
  ],
  imports : [
    CommonModule,
    MaterialModule,
    ServicesModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AngularSplitModule,
    TreeViewModule,
    DetailsModule,
    PipesModule
  ],
  exports : [
    LensComponent,
    CommitBrowserComponent
  ]
})
export class LensModule {}
