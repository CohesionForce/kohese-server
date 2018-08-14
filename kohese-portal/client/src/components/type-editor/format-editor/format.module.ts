import { HeaderContainerEditorComponent } from './format-gui/property-container/header-container/header-container-editor.component';
import { PropertyRowComponent } from './format-gui/property-container/property-row/property-row.component';
import { ContainerSelectorComponent } from './format-gui/container-selector/container-selector.component';
import { FormatEditorComponent } from './format-editor.component';
import { PipesModule } from '../../../pipes/pipes.module';
import { MaterialModule } from '../../../material.module';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormatGuiComponent } from './format-gui/format-gui.component';
import { TableContainerComponent } from './format-gui/property-container/table-container/table-container.component';
import { ListContainerEditorComponent } from './format-gui/property-container/list-container-editor/list-container-editor.component';
import { ColumnContainerEditorComponent } from './format-gui/property-container/column-container-editor/column-container-editor.component';

@NgModule({
  declarations: [
    FormatEditorComponent,
    FormatGuiComponent,
    ContainerSelectorComponent,
    TableContainerComponent,
    ColumnContainerEditorComponent,
    ListContainerEditorComponent,
    PropertyRowComponent,
    HeaderContainerEditorComponent
  ],
  entryComponents: [
    ContainerSelectorComponent
  ],
  exports : [
    FormatEditorComponent,
    FormatGuiComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    PipesModule,
  ]
})
export class FormatModule {

}
