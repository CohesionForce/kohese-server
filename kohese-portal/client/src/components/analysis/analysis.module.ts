import { NgModule } from '@angular/core/';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
    MaterialModule
  ],
  exports : [
    AnalysisComponent,
    PhraseViewComponent,
    SentenceViewComponent,
    TermViewComponent
  ]
})
export class AnalysisModule {}
