/**
 * Created by josh on 8/28/15.
 *
 * Webpack depdendency file.
 */
import { ResizeableModule } from  './resizeableField';
import { NavDirectivesModule } from  './navDirectives/navDirectives';
import { KnowledgeTreeModule } from  './knowledgeTree/treeRow';
import { ActionTableModule } from  './actionTable/actionTable';
import { DocumentViewModule } from  './document-view/document-view';
import { KindIconModule } from  './kind-icon/kind-icon';

// Sub-directive folders
import { AnalysisDirectivesModule } from  './analysis-directives/analysis.config';

export const DirectivesModule =  {
  init : function () {
    ResizeableModule.init();
    NavDirectivesModule.init();
    KnowledgeTreeModule.init();
    ActionTableModule.init();
    DocumentViewModule.init();
    KindIconModule.init();

    AnalysisDirectivesModule.init();
  }
}
