import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';

/* Custom Modules */
import { AnalysisModule } from './components/analysis/analysis.module';
import { DetailsModule } from './components/details/details.module';
import { DocumentViewModule } from './components/document-view/document-view.module';
import { ActionTableModule } from './components/action-table/action-table.module';
import { TypeEditorModule } from './components/type-editor/type-editor.module';
import { CreateWizardModule } from './components/create-wizard/create-wizard.module';
import { PipesModule } from './pipes/pipes.module';

import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminComponent } from './components/admin/admin.component';
import { AppBarComponent} from './components/app-bar/appbar.component';
import { SideBarComponent} from './components/side-bar/sidebar.component';
import { LoginComponent } from './components/login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RepositoriesComponent } from './components/admin/repositories.component';
import { TreeComponent, TreeRowComponent } from './components/tree/tree.component';
import { ExploreComponent } from './components/explore/explore.component';
import { ActionTableComponent } from './components/action-table/action-table.component';
import { IconSelectorComponent } from './components/icon-selector/icon-selector.component';

import { AuthenticationInterceptor } from './services/authentication/authentication.interceptor';
import { AuthenticationService } from './services/authentication/authentication.service';
import { SocketService } from './services/socket/socket.service';
import { SessionService } from './services/user/session.service';
import { VersionControlService } from './services/version-control/version-control.service';
import { NavigationService } from './services/navigation/navigation.service';
import { AnalysisService } from './services/analysis/analysis.service';
import { DynamicTypesService } from './services/dynamic-types/dynamic-types.service';
import { ImportService } from './services/import/import.service';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { AngularSplitModule } from 'angular-split';
import { TreeModule } from 'angular-tree-component';

import { MaterialModule } from './material.module';
import { ItemRepository } from './services/item-repository/item-repository.service';
import { DataProcessingService } from './services/data/data-processing.service';
import { DialogService, DialogComponent } from './services/dialog/dialog.service';

const AUTHENTICATION_INTERCEPTOR = {
  provide: HTTP_INTERCEPTORS,
  useClass: AuthenticationInterceptor,
  multi: true
};

@NgModule({
  declarations: [
    AppComponent,
    AppBarComponent,
    SideBarComponent,
    DashboardComponent,
    AdminComponent,
    LoginComponent,
    RepositoriesComponent,
    TreeComponent,
    ExploreComponent,
    TreeRowComponent,
    DialogComponent,
    IconSelectorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    FlexLayoutModule,
    HttpClientModule,
    NgbModule.forRoot(),
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    PipesModule,
    MaterialModule,
    AngularSplitModule,
    AnalysisModule,
    DetailsModule,
    DocumentViewModule,
    ActionTableModule,
    TypeEditorModule,
    TreeModule,
    CreateWizardModule
  ],
  entryComponents: [
    DialogComponent,
    IconSelectorComponent
  ],
  providers: [
    ItemRepository,
    AuthenticationService,
    AUTHENTICATION_INTERCEPTOR,
    SocketService,
    SessionService,
    VersionControlService,
    NavigationService,
    AnalysisService,
    DataProcessingService,
    DialogService,
    DynamicTypesService,
    ImportService],
  bootstrap: [AppComponent]
})
export class AppModule { }
