// Angular
import { NgModule } from "@angular/core/";
import { CommonModule } from '@angular/common';
import { MaterialModule } from "../../material.module";

// NPM
import { AngularSplitModule } from 'angular-split';

// Kohese
import { AdminComponent} from './admin.component';
import { RepositoriesComponent } from './repositories/repositories.component'
import { RepositoryContentDialog } from './repositories/repositories.component'
import { DevToolsComponent} from './dev-tools/dev-tools.component';
import { AboutComponent } from './about/about.component';

import { ServicesModule } from '../../services/services.module';
import { UserModule } from '../../services/user/user.module'
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PipesModule } from "../../pipes/pipes.module";
import { LensModule } from "../lens/lens.module";
import { ObjectEditorModule } from '../object-editor/object-editor.module';

@NgModule({
  declarations: [
    AdminComponent,
    RepositoryContentDialog,
    RepositoriesComponent,
    DevToolsComponent,
    AboutComponent
  ],
  entryComponents: [
    RepositoryContentDialog
  ],
  imports : [
    CommonModule,
    MaterialModule,
    ServicesModule,
    UserModule,
    FormsModule,
    ReactiveFormsModule,
    PipesModule,
    LensModule,
    ObjectEditorModule,
    AngularSplitModule
  ],
  exports : [
    AdminComponent,
    RepositoriesComponent,
    DevToolsComponent
  ]
})
export class AdminModule {}
