import { NgModule } from '@angular/core';
import { RouterModule, Routes} from '@angular/router';
import { AnalysisModule } from './components/analysis/analysis.module'

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminComponent } from './components/admin/admin.component';
import { LoginComponent } from './components/login/login.component';
import { VersionsComponent } from './components/versions/versions.component';
import { RepositoriesComponent } from './components/admin//repositories/repositories.component';
import { ExploreComponent } from './components/explore/explore.component';
import { AnalysisComponent } from './components/analysis/analysis.component';
import { TypeEditorComponent } from './components/type-editor/type-editor.component';
import { DevToolsComponent } from './components/admin/dev-tools/dev-tools.component';
import { FullscreenDocumentComponent } from './components/document-view/fullscreen-document/fullscreen-document.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full'},
  { path: 'admin', component: AdminComponent },
  { path: 'dashboard', component: DashboardComponent},
  { path: 'login', component: LoginComponent},
  { path: 'versions', component: VersionsComponent },
  { path: 'repositories', component: RepositoriesComponent },
  { path: 'explore', component: ExploreComponent},
  // { path: 'explore/:id', component: ExploreComponent},
  { path: 'analysis', component: AnalysisComponent },
  { path: 'typeeditor', component: TypeEditorComponent},
  { path: 'devtools', component: DevToolsComponent},
  { path: 'document', component: FullscreenDocumentComponent}
]

@NgModule({
  imports: [RouterModule.forRoot(routes),
            AnalysisModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
