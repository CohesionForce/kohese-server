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


import { NgModule } from "@angular/core/";
import { CommonModule } from '@angular/common';
import { MaterialModule } from "../../material.module";

// Other External Dependencies
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
