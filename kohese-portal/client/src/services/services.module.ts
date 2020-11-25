import { ReportService } from './reports/report.service';
/* Core */
import { NgModule } from '@angular/core/';
import { RouterModule } from '@angular/router';

/* Custom */
import { DialogModule } from '../components/dialog/dialog.module';
import { CacheManager } from '../../cache-worker/CacheManager';
import { ItemRepository } from './item-repository/item-repository.service';
import { SocketService } from './socket/socket.service';
import { SessionService } from './user/session.service';
import { VersionControlService } from './version-control/version-control.service';
import { NavigationService } from './navigation/navigation.service';
import { AnalysisService } from './analysis/analysis.service';
import { DynamicTypesService } from './dynamic-types/dynamic-types.service';
import { ImportService } from './import/import.service';
import { UploadService } from './upload/upload.service';
import { NotificationService} from './notifications/notification.service';
import { DataProcessingService } from './data/data-processing.service';
import { DialogService } from './dialog/dialog.service';
import { StateService } from './state/state.service';
import { LensService } from './lens-service/lens.service';
import { ProjectService } from "./project-service/project.service";
import { LogService } from "./log/log.service";


// Log Events
import { InitializeLogs } from './item-repository/item-repository.registry'

@NgModule({
  declarations: [],
  imports: [
    RouterModule,
    DialogModule
  ],
  exports : [],
  entryComponents: [],
  providers: [
    CacheManager,
    ItemRepository,
    SocketService,
    SessionService,
    VersionControlService,
    NavigationService,
    AnalysisService,
    DataProcessingService,
    DialogService,
    DynamicTypesService,
    ImportService,
    UploadService,
    NotificationService,
    StateService,
    LensService,
    ProjectService,
    LogService,
    ReportService
  ]
})
export class ServicesModule {
  public constructor() {
  }
}

