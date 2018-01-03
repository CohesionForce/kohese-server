import { NgModule } from "@angular/core/";
import { AnalysisComponent } from "./analysis.component";
import { PhraseViewComponent } from "./phrase-view/phrase-view.component";
import { SentenceViewComponent } from "./sentence-view/sentence-view.component";
import { TermViewComponent } from "./term-view/term-view.component";

import { SplitPaneModule } from "ng2-split-pane/lib/ng2-split-pane";
import { DocumentViewModule } from '../document-view/document-view.module';
import { CommonModule } from "@angular/common";

@NgModule({
  declarations: [
    AnalysisComponent,
    PhraseViewComponent,
    SentenceViewComponent,
    TermViewComponent
  ],
  imports : [
    SplitPaneModule,
    DocumentViewModule,
    CommonModule
  ],
  exports : [
    AnalysisComponent,
    PhraseViewComponent,
    SentenceViewComponent,
    TermViewComponent
  ]
})
export class AnalysisModule {}
