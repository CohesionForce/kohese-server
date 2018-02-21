import { NgModule } from "@angular/core/";
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations'

import { ImportComponent } from './import/import.component';
import { NewComponent } from './new/new.component';
import { CreateWizardComponent } from './create-wizard.component';
import { MaterialModule } from "../../material.module";
import { PipesModule } from "../../pipes/pipes.module";
import { DetailsModule } from "../../components/details/details.module";

import { TreeModule } from 'angular-tree-component';


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
    DetailsModule,
    TreeModule,
    BrowserAnimationsModule,
    NoopAnimationsModule
    
  ],
  exports : [
    ImportComponent,
    NewComponent,
    CreateWizardComponent
  ]
})
export class CreateWizardModule {}
