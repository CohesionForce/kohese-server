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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ContentContainerComponent } from './components/content-container/content-container.component';
import { TreeComponent } from './components/tree/tree.component';
import { DetailsComponent } from './components/details/details.component';
import { ExploreComponent } from './components/explore/explore.component';

import { UserService } from './services/user/user.service';
import { AuthTokenFactory } from './services/authentication/auth-token.factory';
import { LoginService } from './services/authentication/login.service';
import { AuthInterceptor } from './services/authentication/auth-interceptor.factory';
import { SocketService } from './services/socket/socket.service';
import { TabService } from './services/tab/tab.service';
import { BundleService } from './services/bundle/bundle.service';
import { SessionService } from './services/user/session.service';
import { VersionControlService } from './services/version-control/version-control.service';
import { NavigationService } from './services/navigation/navigation.service';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';

import { MaterialModule } from './material.module';
import { ItemRepository } from './services/item-repository/item-repository.service';

@NgModule({
  declarations: [
    AppComponent,
    ContentContainerComponent,
    AppBarComponent,
    SideBarComponent,
    DashboardComponent,
    AdminComponent,
    LoginComponent,
    TreeComponent,
    DetailsComponent,
    ExploreComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgbModule.forRoot(),
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    MaterialModule
  ],
  providers: [ItemRepository ,UserService, AuthTokenFactory, LoginService, {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    }, SocketService, TabService, BundleService, SessionService,
    VersionControlService, NavigationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
