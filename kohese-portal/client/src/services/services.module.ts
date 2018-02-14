/* Core */
import { NgModule } from "@angular/core/";
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

/* 3rd Party */
import { ToastrModule } from 'ngx-toastr';

/* Custom */
import { ItemRepository } from './item-repository/item-repository.service';
import { AuthenticationInterceptor } from './authentication/authentication.interceptor';
import { AuthenticationService } from './authentication/authentication.service';
import { SocketService } from './socket/socket.service';
import { SessionService } from './user/session.service';
import { VersionControlService } from './version-control/version-control.service';
import { NavigationService } from './navigation/navigation.service';
import { AnalysisService } from './analysis/analysis.service';
import { DynamicTypesService } from './dynamic-types/dynamic-types.service';
import { ImportService } from './import/import.service';
import { DataProcessingService } from './data/data-processing.service';
import { DialogService, DialogComponent } from './dialog/dialog.service';
import { MaterialModule } from "../material.module";

const AUTHENTICATION_INTERCEPTOR = {
  provide: HTTP_INTERCEPTORS,
  useClass: AuthenticationInterceptor,
  multi: true
};

@NgModule({
  declarations: [
    DialogComponent
  ],
  imports : [
    CommonModule,
    ToastrModule,
    MaterialModule
  ],
  exports : [
    DialogComponent
  ],
  entryComponents: [
    DialogComponent
  ],
  providers: [
    ItemRepository,
    AuthenticationService,
    AUTHENTICATION_INTERCEPTOR,
    SocketService,
    SessionService,
    VersionControlService,
    NavigationService,
    AnalysisService,
    DataProcessingService,
    DialogService,
    DynamicTypesService,
    ImportService]
})
export class ServicesModule {}