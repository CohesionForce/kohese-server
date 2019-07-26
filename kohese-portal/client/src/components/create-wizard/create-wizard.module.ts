import { NgModule } from "@angular/core/";
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations'

import { CreateWizardComponent } from './create-wizard.component';
import { MaterialModule } from "../../material.module";
import { PipesModule } from "../../pipes/pipes.module";
import { DetailsModule } from "../../components/details/details.module";

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
    DetailsModule,
    BrowserAnimationsModule,
    NoopAnimationsModule,
    UserInputModule
    
  ],
  exports : [
    CreateWizardComponent,
    UserInputModule
  ]
})
export class CreateWizardModule {}
