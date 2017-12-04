/**
 * Created by josh on 8/28/15.
 *
 * Webpack dependency file
 */
import { TabServiceModule } from  './tabService' ;
import { ItemRepositoryModule } from  './itemRepository' ;
import { AuthenticationServiceModule } from  './authenticationServices' ;
import { AnalysisServiceModule } from  './analysisService' ;
import { DecisionServiceModule } from  './kind-services/decision-service' ;
import { ActionServiceModule } from  './kind-services/action-service' ;
import { IssueServiceModule } from  './kind-services/issue-service' ;
import { CategoryServiceModule } from  './category-services/category-service' ;
import { UserServiceModule } from  './user-services/user-service' ;
import { SessionServiceModule } from  './user-services/session-service' ;
import { NavigationServiceModule } from  './navigation-services/navigation-service' ;
import { SearchServiceModule } from  './search-service' ;
import { VersionControlServiceModule } from  './versionControlService' ;
import { KoheseIOModule } from  './kohese-io' ;
import { ImportServiceModule } from  './importService' ;
import { ModalServiceModule } from  './modal-service/modal-service' ;
import { HighlightServiceModule } from  './highlight-service' ;

export const ServicesModule = {
  init: function () {
    TabServiceModule.init();
    ItemRepositoryModule.init();
    AuthenticationServiceModule.init();
    AnalysisServiceModule.init();
    DecisionServiceModule.init();
    ActionServiceModule.init();
    IssueServiceModule.init();
    CategoryServiceModule.init();
    UserServiceModule.init();
    SessionServiceModule.init();
    NavigationServiceModule.init();
    SearchServiceModule.init();
    VersionControlServiceModule.init();
    KoheseIOModule.init();
    ImportServiceModule.init();
    ModalServiceModule.init();
    HighlightServiceModule.init();
  }
}
