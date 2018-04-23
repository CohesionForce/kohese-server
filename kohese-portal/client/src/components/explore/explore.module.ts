import { NgModule } from "@angular/core/";
import { CommonModule } from '@angular/common';
import { MaterialModule } from "../../material.module";

import { AngularSplitModule} from 'angular-split';

import { ServicesModule } from '../../services/services.module';
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ExploreComponent } from "./explore.component";

import { TreeViewModule } from "../tree/tree.module";
import { LensModule } from '../lens/lens.module'
import { DetailsModule } from "../details/details.module";
import { PipesModule } from "../../pipes/pipes.module";


@NgModule({
  declarations: [
    ExploreComponent
  ],
  entryComponents: [
  ],
  imports : [
    CommonModule,
    MaterialModule,
    ServicesModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AngularSplitModule,
    TreeViewModule,
    DetailsModule,
    PipesModule,
    LensModule
  ],
  exports : [
    ExploreComponent,
  ]
})
export class ExploreModule {}