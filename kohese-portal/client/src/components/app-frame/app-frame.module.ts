import { NgModule } from "@angular/core/";
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
  entryComponents: [
  ],
  imports : [
    CommonModule,
    MaterialModule,
    ServicesModule,
    UserModule,
    BrowserModule,
    FormsModule
  ],
  exports : [
    AppBarComponent,
    SideBarComponent
  ]
})
export class AppFrameModule {}