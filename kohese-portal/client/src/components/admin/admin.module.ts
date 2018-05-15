import { NgModule } from "@angular/core/";
import { CommonModule } from '@angular/common';
import { MaterialModule } from "../../material.module";

import { AdminComponent} from './admin.component';
import { RepositoriesComponent } from './repositories/repositories.component'
import { DevToolsComponent} from './dev-tools/dev-tools.component';

import { ServicesModule } from '../../services/services.module';
import { UserModule } from '../../services/user/user.module'
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PipesModule } from "../../pipes/pipes.module";
import { LensModule } from "../lens/lens.module";

@NgModule({
  declarations: [
    AdminComponent,
    RepositoriesComponent,
    DevToolsComponent
  ],
  entryComponents: [
  ],
  imports : [
    CommonModule,
    MaterialModule,
    ServicesModule,
    UserModule,
    FormsModule,
    ReactiveFormsModule,
    PipesModule,
    LensModule
  ],
  exports : [
    AdminComponent,
    RepositoriesComponent,
    DevToolsComponent
  ]
})
export class AdminModule {}