import { FullscreenDocumentComponent } from './fullscreen-document/fullscreen-document.component';
import { CreationRowComponent } from './creation-row/creation-row.component';
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
    FullscreenDocumentComponent
  ],
  imports : [
    CommonModule,
    InfiniteScrollModule,
    BrowserAnimationsModule,
    BrowserModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports : [
    DocumentViewComponent
  ]
})
export class DocumentViewModule {}
