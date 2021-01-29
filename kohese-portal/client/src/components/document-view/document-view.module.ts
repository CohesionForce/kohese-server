import { UserInputModule } from './../user-input/user-input.module';
import { DocumentRowComponent } from './document-row/document-row.component';
import { TreeViewModule } from '../tree/tree.module';
import { DocumentOutlineComponent } from './document-outline/document-outline.component';
import { CreationRowComponent } from './document-row/creation-row/creation-row.component';
import { MaterialModule } from '../../material.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from "@angular/core";
import { DocumentViewComponent } from './document-view.component';
import { CommonModule } from "@angular/common";
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { AngularSplitModule} from 'angular-split';

import { ObjectEditorModule } from '../object-editor/object-editor.module';

@NgModule({
  declarations: [
    DocumentViewComponent,
    CreationRowComponent,
    DocumentRowComponent,
    DocumentOutlineComponent
  ],
  imports : [
    CommonModule,
    InfiniteScrollModule,
    BrowserAnimationsModule,
    BrowserModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MarkdownModule.forChild(),
    TreeViewModule,
    UserInputModule,
    ObjectEditorModule,
    AngularSplitModule
  ],
  exports : [
    DocumentViewComponent,
    DocumentRowComponent
  ]
})
export class DocumentViewModule {}
