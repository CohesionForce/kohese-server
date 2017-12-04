/**
 * Created by josh on 8/28/15.
 *
 * Webpack dependency file. Will register components with the bundler.
 */
import  { TreeModule } from './tree/tree';
import  { DetailsModule } from './detailsview/detailsview';
import  { ContentContainerModule } from './contentcontainer/contentcontainer';
import  { NavigationMenuModule } from './navigationmenu/navigationmenu';
import  { LoginModule } from './login/login';
import  { SearchModule } from './search/search';
import  { AdminModule } from './admin/admin';
import  { DashboardModule } from './dashboard/dashboard';
import  { CreateWizardModule } from './create/createWizard';
import  { AnalysisModule } from './analysis/analysis';

//Common

import  { ServicesModule } from './common/services/services.config';
import  { DirectivesModule } from './common/directives/directives.config';
import  { SBAdminModule } from './common/sb-admin-2';
import  { ConstantsModule } from './common/constants/constants.config';
import  { FiltersModule } from './common/filters/filters.config';

console.log(ContentContainerModule);

export const Components = {
  //Component Modules
  init : function () {
    console.log(ContentContainerModule);
    ContentContainerModule.init();
    TreeModule.init();
    DetailsModule.init();
    NavigationMenuModule.init();
    LoginModule.init();
    SearchModule.init();
    AdminModule.init();
    DashboardModule.init();
    CreateWizardModule.init();
    AnalysisModule.init();

    ServicesModule.init();
    DirectivesModule.init();
    SBAdminModule.init();
    ConstantsModule.init();
    FiltersModule.init();
  }
}

console.log(Components);
