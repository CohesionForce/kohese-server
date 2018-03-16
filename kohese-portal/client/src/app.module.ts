import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

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

import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminComponent } from './components/admin/admin.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TreeComponent, TreeRowComponent } from './components/tree/tree.component';
import { ExploreComponent } from './components/explore/explore.component';
import { ActionTableComponent } from './components/action-table/action-table.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { AngularSplitModule } from 'angular-split';
import { TreeModule } from 'angular-tree-component';
import { VirtualScrollModule } from 'angular2-virtual-scroll';

import { MaterialModule } from './material.module';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    TreeComponent,
    TreeRowComponent,
    ExploreComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    FlexLayoutModule,
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
    CreateWizardModule,
    AppFrameModule,
    AuthenticationModule,
    LoginModule,
    UserModule,
    ServicesModule,
    AdminModule,
    VirtualScrollModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
