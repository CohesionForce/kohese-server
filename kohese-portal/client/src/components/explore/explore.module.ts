import { NgModule } from "@angular/core/";
import { CommonModule } from '@angular/common';
import { MaterialModule } from "../../material.module";

import { AngularSplitModule} from 'angular-split';

import { ServicesModule } from '../../services/services.module';
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ExploreLensComponent } from "./explore-lens/explore-lens.component";
import { ExploreComponent } from "./explore.component";
import { CommitBrowserComponent } from './explore-lens/commit-browser/commit-browser.component';
import { HistoryLensComponent } from './explore-lens/history-lens/history-lens.component';

import { TreeViewModule } from "../tree/tree.module";
import { DetailsModule } from "../details/details.module";
import { PipesModule } from "../../pipes/pipes.module";


@NgModule({
  declarations: [
    ExploreLensComponent,
    CommitBrowserComponent,
    HistoryLensComponent,
    ExploreComponent
  ],
  entryComponents: [
    CommitBrowserComponent
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
    PipesModule
  ],
  exports : [
    ExploreComponent,
    CommitBrowserComponent
  ]
})
export class ExploreModule {}