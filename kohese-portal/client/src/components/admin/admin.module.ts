import { NgModule } from "@angular/core/";
import { CommonModule } from '@angular/common';
import { MaterialModule } from "../../material.module";

import { AdminComponent} from './admin.component';
import { RepositoriesComponent } from './repositories/repositories.component'

import { ServicesModule } from '../../services/services.module';
import { UserModule } from '../../services/user/user.module'
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PipesModule } from "../../pipes/pipes.module";

@NgModule({
  declarations: [
    AdminComponent,
    RepositoriesComponent
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
    PipesModule
  ],
  exports : [
    AdminComponent,
    RepositoriesComponent
  ]
})
export class AdminModule {}