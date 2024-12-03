/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// Angular
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServiceWorkerModule } from '@angular/service-worker';

import { AppRoutingModule } from './app-routing.module';

// Other External Dependencies
import { ToastrModule } from 'ngx-toastr';
import { AngularSplitModule } from 'angular-split';
import { TreeModule } from '@circlon/angular-tree-component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MarkdownModule } from 'ngx-markdown';

// Kohese
import { environment } from '../environments/environment.prod';
import { AppComponent } from './app.component';
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
import { DashboardModule } from './components/dashboard/dashboard.module';
import { ExploreModule } from './components/explore/explore.module';
import { ObjectEditorModule } from './components/object-editor/object-editor.module';
import { NavigatorModule } from './components/navigator/navigator.module';
import { StateMachineEditorModule } from './components/state-machine-editor/state-machine-editor.module';
import { TreeViewModule } from './components/tree/tree.module'
import { VersionsModule } from './components/versions/versions.module';
import { ReportsModule } from './components/reports/reports.module';
import { ImportModule } from './components/import/import.module';
import { HotkeysHelpModule } from './components/hotkeys/hotkeys-help/hotkeys-help.module'
import { MaterialModule } from './material.module';
import { LensModule } from './components/lens/lens.module';
import { ItemBoardModule } from './components/item-board/item-board.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
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
    ObjectEditorModule,
    NavigatorModule,
    StateMachineEditorModule,
    TreeViewModule,
    VersionsModule,
    LensModule,
    ReportsModule,
    ImportModule,
    ItemBoardModule,
    HotkeysHelpModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
