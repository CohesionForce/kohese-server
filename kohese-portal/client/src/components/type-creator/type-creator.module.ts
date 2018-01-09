import { NgModule } from '@angular/core';
import { TypeCreatorComponent } from './type-creator.component';
import { TypeEditorComponent } from './type-editor/type-editor.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations : [
    TypeCreatorComponent,
    TypeEditorComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    TypeCreatorComponent,
    TypeEditorComponent
  ]
})
export class TypeCreatorModule {}
