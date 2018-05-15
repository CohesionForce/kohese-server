import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaterialModule } from '../../material.module';
import { StateMachineEditorComponent } from './state-machine-editor.component';

@NgModule({
  declarations: [
    StateMachineEditorComponent
  ],
  entryComponents: [
    StateMachineEditorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule
  ]
})
export class StateMachineEditorModule {
}