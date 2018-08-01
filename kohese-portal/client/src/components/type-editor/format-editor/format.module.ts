import { FormatEditorComponent } from './format-editor.component';
import { PipesModule } from './../../../pipes/pipes.module';
import { MaterialModule } from './../../../material.module';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core/';
import { FormatGuiComponent } from './format-gui/format-gui.component';

@NgModule({
  declarations: [
    FormatEditorComponent,
    FormatGuiComponent
  ],
  entryComponents: [
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
