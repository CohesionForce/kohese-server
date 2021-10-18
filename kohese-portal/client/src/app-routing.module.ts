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


import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AnalysisModule } from './components/analysis/analysis.module'
import { ServicesModule } from './services/services.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminComponent } from './components/admin/admin.component';
import { LoginComponent } from './components/login/login.component';
import { VersionsComponent } from './components/versions/versions.component';
import { RepositoriesComponent } from './components/admin//repositories/repositories.component';
import { ExploreComponent } from './components/explore/explore.component';
import { AnalysisComponent } from './components/analysis/analysis.component';
import { TypeEditorComponent } from './components/type-editor/type-editor.component';
import { WordpressComponent } from './components/wordpress/wordpress/wordpress.component';
import { DevToolsComponent } from './components/admin/dev-tools/dev-tools.component';
import { AboutComponent } from './components/admin/about/about.component';
import { DocumentOutlineComponent } from './components/document-view/document-outline/document-outline.component';
import { ReportsComponent } from './components/reports/reports.component';


@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot([
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'admin', component: AdminComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'login', component: LoginComponent },
    { path: 'versions', component: VersionsComponent },
    { path: 'repositories', component: RepositoriesComponent },
    { path: 'explore', component: ExploreComponent },
    { path: 'analysis', component: AnalysisComponent },
    { path: 'typeeditor', component: TypeEditorComponent },
    { path: 'wordpress-editor', component: WordpressComponent },
    { path: 'devtools', component: DevToolsComponent },
    { path: 'about', component: AboutComponent },
    { path: 'outline', component: DocumentOutlineComponent },
    { path: 'reports', component: ReportsComponent }
], { relativeLinkResolution: 'legacy' }),
    AnalysisModule,
    ServicesModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
