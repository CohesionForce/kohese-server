import { FormatModule } from './format-editor/format.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TypeEditorComponent } from './type-editor.component';
import { IconSelectorComponent } from './icon-selector/icon-selector.component';
import { LocalTypeEditorComponent } from './local-type-editor/local-type-editor.component';
import { AttributeEditorComponent } from './attribute-editor/attribute-editor.component';
import { DataModelEditorComponent } from './data-model-editor/data-model-editor.component';
import { ViewModelEditorComponent } from './view-model-editor/view-model-editor.component';

import { MaterialModule } from '../../material.module';
import { PipesModule } from '../../pipes/pipes.module';
import { StateMachineEditorModule } from '../state-machine-editor/state-machine-editor.module';

import { AngularSplitModule } from 'angular-split';

@NgModule({
  declarations: [
    TypeEditorComponent,
    IconSelectorComponent,
    LocalTypeEditorComponent,
    AttributeEditorComponent,
    DataModelEditorComponent,
    ViewModelEditorComponent
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
