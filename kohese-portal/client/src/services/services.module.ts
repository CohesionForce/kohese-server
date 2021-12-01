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


import { ReportService } from './reports/report.service';
/* Core */
import { NgModule } from '@angular/core/';
import { RouterModule } from '@angular/router';

/* Custom */
import { DialogModule } from '../components/dialog/dialog.module';
import { CacheManager } from '../../cache-worker/CacheManager';
import { ItemRepository } from './item-repository/item-repository.service';
import { SessionService } from './user/session.service';
import { VersionControlService } from './version-control/version-control.service';
import { RepositoryService } from './repository/repository.service';
import { NavigationService } from './navigation/navigation.service';
import { AnalysisService } from './analysis/analysis.service';
import { DynamicTypesService } from './dynamic-types/dynamic-types.service';
import { NotificationService} from './notifications/notification.service';
import { DataProcessingService } from './data/data-processing.service';
import { DialogService } from './dialog/dialog.service';
import { StateService } from './state/state.service';
import { LensService } from './lens-service/lens.service';
import { ProjectService } from "./project-service/project.service";
import { LogService } from "./log/log.service";
import { Hotkeys } from './hotkeys/hot-key.service';


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
    SessionService,
    VersionControlService,
    RepositoryService,
    NavigationService,
    AnalysisService,
    DataProcessingService,
    DialogService,
    DynamicTypesService,
    NotificationService,
    StateService,
    LensService,
    ProjectService,
    LogService,
    Hotkeys,
    ReportService
  ]
})
export class ServicesModule {
  public constructor() {
  }
}

