import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminComponent } from './components/admin/admin.component';
import { AppBarComponent} from './components/app-bar/appbar.component';
import { SideBarComponent} from './components/side-bar/sidebar.component';
import { LoginComponent } from './components/login/login.component';

import { UserService } from './services/user.service';
import { TabService } from './services/tab-service/tab.service';
import { BundleService } from './services/bundle-service/bundle.service';
import { ContentContainerComponent } from './components/content-container/content-container.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent,
    ContentContainerComponent,
    AppBarComponent,
    SideBarComponent,
    DashboardComponent,
    AdminComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    NgbModule.forRoot()
  ],
  providers: [UserService, TabService, BundleService],
  bootstrap: [AppComponent]
})
export class AppModule { }
