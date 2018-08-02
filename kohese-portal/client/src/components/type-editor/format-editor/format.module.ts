import { PropertyRowComponent } from './format-gui/property-container/property-row/property-row.component';
import { ContainerSelectorComponent } from './format-gui/container-selector/container-selector.component';
import { FormatEditorComponent } from './format-editor.component';
import { PipesModule } from './../../../pipes/pipes.module';
import { MaterialModule } from './../../../material.module';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core/';
import { FormatGuiComponent } from './format-gui/format-gui.component';
import { TableContainerComponent } from './format-gui/property-container/table-container/table-container.component';
import { ListContainerComponent } from './format-gui/property-container/list-container/list-container.component';
import { ColumnContainerComponent } from './format-gui/property-container/column-container/column-container.component';

@NgModule({
  declarations: [
    FormatEditorComponent,
    FormatGuiComponent,
    ContainerSelectorComponent,
    TableContainerComponent,
    ColumnContainerComponent,
    ListContainerComponent,
    PropertyRowComponent
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
