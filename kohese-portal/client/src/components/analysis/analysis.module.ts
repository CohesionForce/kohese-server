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


import { NgModule } from '@angular/core/';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AnalysisComponent } from './analysis.component';
import { PhraseViewComponent } from './phrase-view/phrase-view.component';
import { SentenceViewComponent } from './sentence-view/sentence-view.component';
import { TermViewComponent } from './term-view/term-view.component';

import { AngularSplitModule } from 'angular-split';
import { DocumentViewModule } from '../document-view/document-view.module';
import { PipesModule } from '../../pipes/pipes.module';
import { MaterialModule } from '../../material.module';

@NgModule({
  declarations: [
    AnalysisComponent,
    PhraseViewComponent,
    SentenceViewComponent,
    TermViewComponent
  ],
  imports : [
    AngularSplitModule,
    DocumentViewModule,
    CommonModule,
    FormsModule,
    PipesModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  exports : [
    AnalysisComponent,
    PhraseViewComponent,
    SentenceViewComponent,
    TermViewComponent
  ]
})
export class AnalysisModule {}
