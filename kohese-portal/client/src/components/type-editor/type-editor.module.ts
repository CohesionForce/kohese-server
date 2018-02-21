import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TypeEditorComponent } from './type-editor.component';
import { TypeOverviewComponent } from './type-overview/type-overview.component';
import { PropertyEditorComponent } from './property-editor/property-editor.component';

import { MaterialModule } from '../../material.module';
import { PipesModule } from '../../pipes/pipes.module';

import { AngularSplitModule } from 'angular-split';

@NgModule({
  declarations: [
    TypeEditorComponent,
    TypeOverviewComponent,
    PropertyEditorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    PipesModule,
    AngularSplitModule
  ]
})
export class TypeEditorModule {
}