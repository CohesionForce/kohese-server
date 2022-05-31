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


import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { MaterialModule } from "../../material.module";

import { SideBarComponent } from './side-bar/sidebar.component';
import { AppBarComponent } from './app-bar/appbar.component';
import { ServicesModule } from '../../services/services.module';
import { UserModule } from '../../services/user/user.module'
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";

@NgModule({
    declarations: [
        AppBarComponent,
        SideBarComponent
    ],
    imports: [
        CommonModule,
        MaterialModule,
        ServicesModule,
        UserModule,
        BrowserModule,
        FormsModule
    ],
    exports: [
        AppBarComponent,
        SideBarComponent
    ]
})
export class AppFrameModule {}
