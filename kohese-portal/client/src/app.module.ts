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
import { RepositoriesComponent } from './components/admin/repositories.component';
import { TreeComponent } from './components/tree/tree.component';
import { DetailsComponent } from './components/details/details.component';
import { ExploreComponent } from './components/explore/explore.component';
import { TreeRowComponent } from './components/tree/tree-row/tree-row.component';
import { VersionControlRowComponent } from './components/tree/version-control-row/version-control-row.component';
import { KindIconComponent } from './components/kind-icon/kind-icon.component';
import { DocumentViewComponent } from './components/document-view/document-view.component';

import { AuthenticationInterceptor } from './services/authentication/authentication.interceptor';
import { AuthenticationService } from './services/authentication/authentication.service';
import { SocketService } from './services/socket/socket.service';
import { TabService } from './services/tab/tab.service';
import { BundleService } from './services/bundle/bundle.service';
import { SessionService } from './services/user/session.service';
import { VersionControlService } from './services/version-control/version-control.service';
import { NavigationService } from './services/navigation/navigation.service';
import { MapKeyPipe } from './pipes/map-key.pipe';
import { HighlightRegexPipe } from './pipes/Highlight.pipe';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';

import { MaterialModule } from './material.module';
import { ItemRepository } from './services/item-repository/item-repository.service';

const AUTHENTICATION_INTERCEPTOR = {
  provide: HTTP_INTERCEPTORS,
  useClass: AuthenticationInterceptor,
  multi: true
};

@NgModule({
  declarations: [
    AppComponent,
    ContentContainerComponent,
    AppBarComponent,
    SideBarComponent,
    DashboardComponent,
    AdminComponent,
    LoginComponent,
    MapKeyPipe,
    HighlightRegexPipe,
    RepositoriesComponent,
    TreeComponent,
    DetailsComponent,
    ExploreComponent,
    TreeRowComponent,
    VersionControlRowComponent,
    KindIconComponent,
    DocumentViewComponent

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgbModule.forRoot(),
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    MaterialModule,
    SplitPaneModule
  ],
  providers: [ItemRepository, AuthenticationService,
    AUTHENTICATION_INTERCEPTOR, SocketService, TabService,
    BundleService, SessionService, VersionControlService,
    NavigationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
