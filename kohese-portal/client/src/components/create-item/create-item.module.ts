import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { CreateItemComponent } from './create-item.component';
import { FileUploadModule } from 'ng2-file-upload';

@NgModule({
  declarations: [
    CreateItemComponent
  ],
  imports : [
    CommonModule,
    MaterialModule,
    FormsModule,
    FileUploadModule
  ],
  exports : [
    CreateItemComponent
  ]
})
export class CreateItemModule {}
