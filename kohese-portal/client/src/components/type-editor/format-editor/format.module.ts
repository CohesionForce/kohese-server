import { DocumentViewModule } from './../../document-view/document-view.module';
import { FormatPreviewComponent } from './format-preview/format-preview.component';
import { HeaderContainerEditorComponent } from './format-gui/property-container/header-container/header-container-editor.component';
import { PropertyRowComponent } from './format-gui/property-container/property-row/property-row.component';
import { ContainerSelectorComponent } from './format-gui/container-selector/container-selector.component';
import { PipesModule } from '../../../pipes/pipes.module';
import { MaterialModule } from '../../../material.module';
import { UserInputModule } from '../../user-input/user-input.module';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormatGuiComponent } from './format-gui/format-gui.component';
import { TableContainerComponent } from './format-gui/property-container/table-container/table-container.component';
import { ListContainerEditorComponent } from './format-gui/property-container/list-container-editor/list-container-editor.component';
import { ColumnContainerEditorComponent } from './format-gui/property-container/column-container-editor/column-container-editor.component';
import { TableEditorComponent } from './table-editor/table-editor.component';
import { TablePreviewDialogComponent } from './table-editor/table-preview-dialog/table-preview-dialog.component';

@NgModule({
  declarations: [
    FormatGuiComponent,
    ContainerSelectorComponent,
    TableContainerComponent,
    ColumnContainerEditorComponent,
    ListContainerEditorComponent,
    PropertyRowComponent,
    HeaderContainerEditorComponent,
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
    FormatGuiComponent,
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
