import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { MaterialModule } from "../../material.module";

import { AngularSplitModule} from 'angular-split';

import { ServicesModule } from '../../services/services.module';
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";

import { TreeRowComponent } from './tree-row/tree-row.component';
import { DefaultTreeComponent } from './default-tree/default-tree.component';
import { ReferenceTreeComponent } from './reference-tree/reference-tree.component';
import { VersionControlTreeComponent } from './version-control-tree/version-control-tree.component';
import { CommitTreeComponent } from './commit-tree/commit-tree.component';
import { VirtualScrollModule } from 'angular2-virtual-scroll';
import { PipesModule } from "../../pipes/pipes.module";
import { DocumentTreeComponent } from "./document-tree/document-tree.component";

@NgModule({
  declarations: [
    TreeRowComponent,
    DefaultTreeComponent,
    ReferenceTreeComponent,
    VersionControlTreeComponent,
    CommitTreeComponent,
    DocumentTreeComponent
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
    DefaultTreeComponent,
    ReferenceTreeComponent,
    VersionControlTreeComponent,
    CommitTreeComponent,
    DocumentTreeComponent
  ]
})
export class TreeViewModule {}
