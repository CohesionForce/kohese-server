/*
*   Webpack configuration file for analysis directives
*/
import { PhraseViewModule } from './phrase-view';
import { SentenceViewModule } from './sentence-view';
import { TermViewModule } from './term-view';


export const AnalysisDirectivesModule = {
  init: function () {
    PhraseViewModule.init();
    SentenceViewModule.init();
    TermViewModule.init();
  }
}
