import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { KTextComponent } from './k-text/k-text.component';
import { KProxySelectorComponent } from './k-proxy-selector/k-proxy-selector.component';
import { KDateComponent } from './k-date/k-date.component';
import { KSelectComponent } from './k-select/k-select.component';
import { KStateEditorComponent } from './k-state-editor/k-state-editor.component';
import { KUserSelectorComponent } from './k-user-selector/k-user-selector.component';

@NgModule({
  declarations: [
    KTextComponent,
    KProxySelectorComponent,
    KUserSelectorComponent,
    KDateComponent,
    KSelectComponent,
    KStateEditorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  exports: [
    KTextComponent,
    KProxySelectorComponent,
    KUserSelectorComponent,
    KDateComponent,
    KSelectComponent,
    KStateEditorComponent
  ]
})
export class UserInputModule {}
