import { NgModule } from "@angular/core/src/metadata/ng_module";
import { AnalysisComponent } from "./analysis.component";
import { PhraseViewComponent } from "./phrase-view/phrase-view.component";
import { SentenceViewComponent } from "./sentence-view/sentence-view.component";
import { TermViewComponent } from "./term-view/term-view.component";


@NgModule({
  declarations: [
    AnalysisComponent,
    PhraseViewComponent,
    SentenceViewComponent,
    TermViewComponent
  ],
  imports : [

  ],
  exports : [
    AnalysisComponent,
    PhraseViewComponent,
    SentenceViewComponent,
    TermViewComponent
  ]
})
export class AnalysisModule {}
