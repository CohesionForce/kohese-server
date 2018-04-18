import { NgModule } from "@angular/core/";
import { CommonModule } from '@angular/common';
import { MaterialModule } from "../../material.module";

import { AngularSplitModule} from 'angular-split';

import { ServicesModule } from '../../services/services.module';
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { ExploreLensComponent } from "./explore-lens/explore-lens.component";
import { ExploreComponent } from "./explore.component";
import { TreeViewModule } from "../tree/tree.module";
import { DetailsModule } from "../details/details.module";


@NgModule({
  declarations: [
    ExploreLensComponent,
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
    AngularSplitModule,
    TreeViewModule,
    DetailsModule
  ],
  exports : [
    ExploreComponent
  ]
})
export class ExploreModule {}