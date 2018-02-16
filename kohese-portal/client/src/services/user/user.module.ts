import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentUserService } from './current-user.service';
import { SessionService } from './session.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers : [
    CurrentUserService,
    SessionService
  ]
}) export class UserModule {}