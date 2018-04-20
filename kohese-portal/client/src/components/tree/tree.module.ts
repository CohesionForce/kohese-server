import { NgModule } from "@angular/core/";
import { CommonModule } from '@angular/common';
import { MaterialModule } from "../../material.module";

import { AngularSplitModule} from 'angular-split';

import { ServicesModule } from '../../services/services.module';
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";

import { TreeComponent } from './tree.component';
import { TreeRowComponent } from './tree-row.component';
import { VirtualScrollModule } from 'angular2-virtual-scroll';
import { PipesModule } from "../../pipes/pipes.module";

@NgModule({
  declarations: [
    TreeComponent,
    TreeRowComponent
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
    VirtualScrollModule,
    PipesModule
  ],
  exports : [
    TreeComponent,
    TreeRowComponent
  ]
})
export class TreeViewModule {}