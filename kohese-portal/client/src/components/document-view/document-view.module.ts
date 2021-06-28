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


import { UserInputModule } from './../user-input/user-input.module';
import { DocumentRowComponent } from './document-row/document-row.component';
import { TreeViewModule } from '../tree/tree.module';
import { DocumentOutlineComponent } from './document-outline/document-outline.component';
import { CreationRowComponent } from './document-row/creation-row/creation-row.component';
import { MaterialModule } from '../../material.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from "@angular/core";
import { DocumentViewComponent } from './document-view.component';
import { CommonModule } from "@angular/common";
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { AngularSplitModule} from 'angular-split';

import { ObjectEditorModule } from '../object-editor/object-editor.module';

@NgModule({
  declarations: [
    DocumentViewComponent,
    CreationRowComponent,
    DocumentRowComponent,
    DocumentOutlineComponent
  ],
  imports : [
    CommonModule,
    InfiniteScrollModule,
    BrowserAnimationsModule,
    BrowserModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MarkdownModule.forChild(),
    TreeViewModule,
    UserInputModule,
    ObjectEditorModule,
    AngularSplitModule
  ],
  exports : [
    DocumentViewComponent,
    DocumentRowComponent
  ]
})
export class DocumentViewModule {}
