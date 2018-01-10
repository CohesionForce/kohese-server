import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { TypeCreatorComponent } from './type-creator.component';
import { TypeEditorComponent } from './type-editor/type-editor.component';
import { CommonModule } from '@angular/common';
import { PipesModule } from '../../pipes/pipes.module';
import { MaterialModule } from '../../material.module';

@NgModule({
  declarations : [
    TypeCreatorComponent,
    TypeEditorComponent
  ],
  imports: [
    CommonModule,
    PipesModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    TypeCreatorComponent,
    TypeEditorComponent
  ]
})
export class TypeCreatorModule {}
