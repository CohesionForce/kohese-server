import { DocumentRowComponent } from './document-row/document-row.component';
import { TreeViewModule } from './../tree/tree.module';
import { FullscreenDocumentComponent } from './fullscreen-document/fullscreen-document.component';
import { CreationRowComponent } from './document-row/creation-row/creation-row.component';
import { MaterialModule } from './../../material.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from "@angular/core/";
import { DocumentViewComponent } from './document-view.component';
import { CommonModule } from "@angular/common";
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

@NgModule({
  declarations: [
    DocumentViewComponent,
    CreationRowComponent,
    DocumentRowComponent,
    FullscreenDocumentComponent
  ],
  imports : [
    CommonModule,
    InfiniteScrollModule,
    BrowserAnimationsModule,
    BrowserModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TreeViewModule
  ],
  exports : [
    DocumentViewComponent
  ]
})
export class DocumentViewModule {}
