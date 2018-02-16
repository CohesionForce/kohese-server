/* Core */
import { NgModule } from "@angular/core/";
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AuthenticationInterceptor } from './authentication.interceptor';
import { AuthenticationService } from './authentication.service';
import { UserModule } from '../user/user.module';

const AUTHENTICATION_INTERCEPTOR = {
  provide: HTTP_INTERCEPTORS,
  useClass: AuthenticationInterceptor,
  multi: true
};

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    UserModule
  ],
  providers: [
    AuthenticationService,
    AUTHENTICATION_INTERCEPTOR
  ]
}) export class AuthenticationModule {}