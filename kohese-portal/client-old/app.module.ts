
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';

import { AuthTokenService } from './client-common/services/auth/authToken.service'
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';

@NgModule({
  imports: [
    BrowserModule,
    UpgradeModule
  ],
  bootstrap: [],
  providers: [AuthTokenService]
})
export class AppModule implements OnInit{

  constructor() {
    console.log('App modules construct')
  }
  ngDoBootstrap() {}

  ngOnInit() {
    console.log('App Module');
  }
}
