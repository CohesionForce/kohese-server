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
import { LocalTypeEditorComponent } from './local-type-editor/local-type-editor.component';
import { AttributeEditorComponent } from './attribute-editor/attribute-editor.component';

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
    LocalTypeEditorComponent,
    AttributeEditorComponent
  ],
  entryComponents: [
    IconSelectorComponent,
    LocalTypeEditorComponent,
    AttributeEditorComponent
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
