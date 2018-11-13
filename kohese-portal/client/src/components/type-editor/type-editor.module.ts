import { TableColumnSelectorComponent } from './property-editor/table-editor/table-column-selector/table-column-selector.component';
import { TableEditorComponent } from './property-editor/table-editor/table-editor.component';
import { FormatModule } from './format-editor/format.module';
import { FormatGuiComponent } from './format-editor/format-gui/format-gui.component';
import { FormatEditorComponent } from './format-editor/format-editor.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TypeEditorComponent } from './type-editor.component';
import { TypeOverviewComponent } from './type-overview/type-overview.component';
import { PropertyEditorComponent } from './property-editor/property-editor.component';
import { IconSelectorComponent } from './icon-selector/icon-selector.component';

import { MaterialModule } from '../../material.module';
import { PipesModule } from '../../pipes/pipes.module';
import { StateMachineEditorModule } from '../state-machine-editor/state-machine-editor.module';

import { AngularSplitModule } from 'angular-split';

@NgModule({
  declarations: [
    TypeEditorComponent,
    TypeOverviewComponent,
    PropertyEditorComponent,
    IconSelectorComponent,
    TableEditorComponent,
    TableColumnSelectorComponent
  ],
  entryComponents: [
    IconSelectorComponent,
    TableColumnSelectorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    PipesModule,
    AngularSplitModule,
    StateMachineEditorModule,
    FormatModule
  ]
})
export class TypeEditorModule {
}
