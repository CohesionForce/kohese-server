import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ServiceWorkerModule } from '@angular/service-worker';

import { AppComponent } from './app.component';

/* Custom Modules */
import { AnalysisModule } from './components/analysis/analysis.module';
import { DetailsModule } from './components/details/details.module';
import { DocumentViewModule } from './components/document-view/document-view.module';
import { ActionTableModule } from './components/action-table/action-table.module';
import { TypeEditorModule } from './components/type-editor/type-editor.module';
import { CreateWizardModule } from './components/create-wizard/create-wizard.module';
import { PipesModule } from './pipes/pipes.module';
import { AppFrameModule } from './components/app-frame/app-frame.module';
import { ServicesModule } from './services/services.module';
import { AuthenticationModule } from './services/authentication/authentication.module';
import { LoginModule } from './components/login/login.module';
import { UserModule } from './services/user/user.module';
import { AdminModule } from './components/admin/admin.module';
import { CompareItemsModule } from './components/compare-items/compare-items.module';
import { AppRoutingModule } from './app-routing.module';
import { DashboardModule } from './components/dashboard/dashboard.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ExploreModule } from './components/explore/explore.module';
import { NavigatorModule } from './components/navigator/navigator.module';
import { TreeViewModule } from './components/tree/tree.module'

import { ToastrModule } from 'ngx-toastr';
import { AngularSplitModule } from 'angular-split';
import { TreeModule } from 'angular-tree-component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MarkdownModule } from 'ngx-markdown';

import { MaterialModule } from './material.module';
import { environment } from '../environments/environment.prod';
import { LensModule } from './components/lens/lens.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('/ngsw-worker.js', {enabled : true}),
    ToastrModule.forRoot(),
    MarkdownModule.forRoot(),
    InfiniteScrollModule,
    PipesModule,
    MaterialModule,
    AngularSplitModule,
    AnalysisModule,
    DetailsModule,
    DocumentViewModule,
    ActionTableModule,
    TypeEditorModule,
    TreeModule,
    CreateWizardModule,
    AppFrameModule,
    AuthenticationModule,
    LoginModule,
    UserModule,
    ServicesModule,
    AdminModule,
    DashboardModule,
    CompareItemsModule,
    ExploreModule,
    NavigatorModule,
    TreeViewModule,
    LensModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
