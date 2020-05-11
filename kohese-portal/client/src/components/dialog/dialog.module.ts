import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatButtonModule, MatCheckboxModule, MatInputModule,
  MatDatepickerModule, MatSelectModule, MatStepperModule,
  MatIconModule } from '@angular/material';

import { MarkdownEditorModule } from '../markdown-editor/markdown-editor.module';
import { SimpleDialogComponent } from './simple-dialog/simple-dialog.component';
import { InputDialogComponent } from './input-dialog/input-dialog.component';
import { DynamicComponentDirective,
  ComponentDialogComponent } from './component-dialog/component-dialog.component';

@NgModule({
  declarations: [
    SimpleDialogComponent,
    InputDialogComponent,
    DynamicComponentDirective,
    ComponentDialogComponent
  ],
  entryComponents: [
    SimpleDialogComponent,
    InputDialogComponent,
    ComponentDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatStepperModule,
    MatIconModule,
    MarkdownEditorModule
  ]
})
export class DialogModule {
  public constructor() {
  }
}
