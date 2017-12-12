import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';

import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminComponent } from './components/admin/admin.component';
import { AppBarComponent} from './components/app-bar/appbar.component';
import { SideBarComponent} from './components/side-bar/sidebar.component';
import { LoginComponent } from './components/login/login.component';

import { UserService } from './services/user.service';
import { AuthTokenFactory } from './services/authentication-services/auth-token.factory';
import { LoginService } from './services/authentication-services/login.service';
import { AuthInterceptor } from './services/authentication-services/auth-interceptor.factory';
import { KoheseIoService } from './services/kohese-io.service';
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
    HttpClientModule,
    NgbModule.forRoot()
  ],
  providers: [UserService, AuthTokenFactory, LoginService, {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true,
  }, KoheseIoService, TabService, BundleService],
  bootstrap: [AppComponent]
})
export class AppModule { }
