import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TextUserInputComponent } from './text-user-input.component';
import { ProxySelectorUserInputComponent } from './proxy-selector-user-input.component';
import { DateUserInputComponent } from './date-user-input.component';

@NgModule({
  declarations: [
    TextUserInputComponent,
    ProxySelectorUserInputComponent,
    DateUserInputComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  exports: [
    TextUserInputComponent,
    ProxySelectorUserInputComponent,
    DateUserInputComponent
  ]
})
export class UserInputModule {}
