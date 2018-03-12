/* Core */
import { NgModule } from "@angular/core/";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';

/* 3rd Party */
import { ToastrModule } from 'ngx-toastr';

/* Custom */
import { ItemRepository } from './item-repository/item-repository.service';
import { SocketService } from './socket/socket.service';
import { SessionService } from './user/session.service';
import { VersionControlService } from './version-control/version-control.service';
import { NavigationService } from './navigation/navigation.service';
import { AnalysisService } from './analysis/analysis.service';
import { DynamicTypesService } from './dynamic-types/dynamic-types.service';
import { ImportService } from './import/import.service';
import { DataProcessingService } from './data/data-processing.service';
import { DialogService, DialogComponent } from './dialog/dialog.service';
import { StateService } from './state/state.service';
import { MaterialModule } from "../material.module";

@NgModule({
  declarations: [
    DialogComponent
  ],
  imports : [
    CommonModule,
    ToastrModule,
    MaterialModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports : [
    DialogComponent
  ],
  entryComponents: [
    DialogComponent
  ],
  providers: [
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
    StateService
  ]
})
export class ServicesModule {}