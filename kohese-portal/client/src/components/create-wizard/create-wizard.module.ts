import { NgModule } from "@angular/core/";
import { ImportComponent } from './import/import.component';
import { NewComponent } from './new/new.component';
import { CreateWizardComponent } from './create-wizard.component';

import { CommonModule } from '@angular/common';

import { MaterialModule } from "../../material.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PipesModule } from "../../pipes/pipes.module";
import { DetailsModule } from "../../components/details/details.module";


@NgModule({
  declarations: [
    ImportComponent,
    NewComponent,
    CreateWizardComponent,
  ],
  entryComponents: [
    ImportComponent,
    CreateWizardComponent
  ],
  imports : [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    PipesModule,
    DetailsModule
  ],
  exports : [
    ImportComponent,
    NewComponent,
    CreateWizardComponent
  ]
})
export class CreateWizardModule {}
