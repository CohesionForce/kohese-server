import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { AuthenticationModule } from '../../services/authentication/authentication.module';
import { LoginComponent } from './login.component';
@NgModule({
  declarations: [ LoginComponent ],
  exports: [ LoginComponent ],
  imports: [ AuthenticationModule,
             CommonModule,
             FormsModule,
             ReactiveFormsModule ]
}) export class LoginModule {}