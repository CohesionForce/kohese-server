import { NgModule } from "@angular/core/";
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { CreateWizardComponent } from './create-wizard.component';
import { MaterialModule } from "../../material.module";
import { PipesModule } from "../../pipes/pipes.module";
import { ObjectEditorModule } from '../object-editor/object-editor.module';

import { UserInputModule } from "../user-input/user-input.module";


@NgModule({
  declarations: [
    CreateWizardComponent
  ],
  entryComponents: [
    CreateWizardComponent
  ],
  imports : [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    PipesModule,
    ObjectEditorModule,
    BrowserAnimationsModule,
    UserInputModule
    
  ],
  exports : [
    CreateWizardComponent,
    UserInputModule
  ]
})
export class CreateWizardModule {}
