import { NgModule } from '@angular/core/';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { UploadImageComponent } from './upload-image.component';

import { UserInputModule } from "../user-input/user-input.module";


@NgModule({
  declarations: [
    UploadImageComponent,
  ],

  entryComponents: [
    UploadImageComponent
  ],

  imports : [
    CommonModule,
    MaterialModule,
    FormsModule,
    BrowserAnimationsModule,
    UserInputModule
  ],

  exports : [
    UploadImageComponent
  ]
})
export class UploadImageModule {}
