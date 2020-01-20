import { DocumentViewModule } from './../../document-view/document-view.module';
import { FormatPreviewComponent } from './format-preview/format-preview.component';
import { ContainerSelectorComponent } from './format-gui/container-selector/container-selector.component';
import { PipesModule } from '../../../pipes/pipes.module';
import { MaterialModule } from '../../../material.module';
import { UserInputModule } from '../../user-input/user-input.module';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TableEditorComponent } from './table-editor/table-editor.component';
import { TablePreviewDialogComponent } from './table-editor/table-preview-dialog/table-preview-dialog.component';

@NgModule({
  declarations: [
    ContainerSelectorComponent,
    FormatPreviewComponent,
    TableEditorComponent,
    TablePreviewDialogComponent
  ],
  entryComponents: [
    ContainerSelectorComponent,
    FormatPreviewComponent,
    TablePreviewDialogComponent
  ],
  exports : [
    TableEditorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    PipesModule,
    UserInputModule,
    DocumentViewModule
  ]
})
export class FormatModule {

}
