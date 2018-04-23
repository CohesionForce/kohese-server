import { NgModule } from "@angular/core/";
import { CommonModule } from '@angular/common';
import { MaterialModule } from "../../material.module";

import { AngularSplitModule} from 'angular-split';

import { ServicesModule } from '../../services/services.module';
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommitBrowserComponent } from './commit-browser/commit-browser.component';
import { HistoryLensComponent } from './history-lens/history-lens.component';
import { LensComponent } from './lens.component';

import { TreeViewModule } from "../tree/tree.module";
import { DetailsModule } from "../details/details.module";
import { PipesModule } from "../../pipes/pipes.module";


@NgModule({
  declarations: [
    CommitBrowserComponent,
    HistoryLensComponent,
    LensComponent

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
    LensComponent,
    CommitBrowserComponent
  ]
})
export class LensModule {}