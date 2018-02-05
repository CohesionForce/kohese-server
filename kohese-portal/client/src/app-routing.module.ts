import { NgModule } from '@angular/core';
import { RouterModule, Routes} from '@angular/router';
import { AnalysisModule } from './components/analysis/analysis.module'

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminComponent } from './components/admin/admin.component';
import { LoginComponent } from './components/login/login.component';
import { RepositoriesComponent } from './components/admin/repositories.component';
import { ExploreComponent } from './components/explore/explore.component';
import { AnalysisComponent } from './components/analysis/analysis.component';
import { TypeCreatorComponent } from './components/type-creator/type-creator.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full'},
  { path: 'admin', component: AdminComponent },
  { path: 'dashboard', component: DashboardComponent},
  { path: 'login', component: LoginComponent},
  { path: 'repositories', component: RepositoriesComponent },
  { path: 'explore', component: ExploreComponent},
  // { path: 'explore/:id', component: ExploreComponent},
  { path: 'analysis', component: AnalysisComponent },
  { path: 'typecreator', component: TypeCreatorComponent}
]

@NgModule({
  imports: [RouterModule.forRoot(routes),
            AnalysisModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
