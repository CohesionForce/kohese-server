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


import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { MaterialModule } from "../../material.module";

import { AngularSplitModule} from 'angular-split';

import { ServicesModule } from '../../services/services.module';
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";

import { TreeRowComponent } from './tree-row/tree-row.component';
import { DefaultTreeComponent } from './default-tree/default-tree.component';
import { ReferenceTreeComponent } from './reference-tree/reference-tree.component';
import { VersionControlTreeComponent } from './version-control-tree/version-control-tree.component';
import { CommitTreeComponent } from './commit-tree/commit-tree.component';
import { FilterTreeComponent } from './filter-tree/filter-tree.component';
import { FilterTreeRowComponent } from './filter-tree/filter-tree-row.component';
import { VirtualScrollModule } from 'angular2-virtual-scroll';
import { PipesModule } from "../../pipes/pipes.module";
import { DocumentTreeComponent } from "./document-tree/document-tree.component";
import { TreeComponent } from './tree.component';

@NgModule({
  declarations: [
    TreeRowComponent,
    DefaultTreeComponent,
    ReferenceTreeComponent,
    VersionControlTreeComponent,
    CommitTreeComponent,
    DocumentTreeComponent,
    FilterTreeComponent,
    FilterTreeRowComponent,
    TreeComponent
  ],
  entryComponents: [
    TreeComponent
  ],
  imports : [
    CommonModule,
    MaterialModule,
    ServicesModule,
    BrowserModule,
    FormsModule,
    AngularSplitModule,
    VirtualScrollModule,
    PipesModule
  ],
  exports : [
    DefaultTreeComponent,
    ReferenceTreeComponent,
    VersionControlTreeComponent,
    CommitTreeComponent,
    DocumentTreeComponent,
    FilterTreeComponent,
    TreeComponent
  ]
})
export class TreeViewModule {}
