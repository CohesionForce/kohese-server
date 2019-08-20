import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaterialModule } from '../../material.module';
import { CopyComponent } from './copy.component';

@NgModule({
  declarations: [CopyComponent],
  entryComponents: [CopyComponent],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule
  ]
})
export class CopyModule {
  public constructor() {
  }
}
