import { NgModule } from "@angular/core/";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { AnalysisComponent } from "./analysis.component";
import { PhraseViewComponent } from "./phrase-view/phrase-view.component";
import { SentenceViewComponent } from "./sentence-view/sentence-view.component";
import { TermViewComponent } from "./term-view/term-view.component";

import { SplitPaneModule } from "ng2-split-pane/lib/ng2-split-pane";
import { DocumentViewModule } from '../document-view/document-view.module';
import { PipesModule } from "../../pipes/pipes.module";

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
    CommonModule,
    FormsModule,
    PipesModule
  ],
  exports : [
    AnalysisComponent,
    PhraseViewComponent,
    SentenceViewComponent,
    TermViewComponent
  ]
})
export class AnalysisModule {}
