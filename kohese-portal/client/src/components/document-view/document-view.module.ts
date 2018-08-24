import { ColumnContainerComponent } from './document-row/format-containers/column-container/column-container.component';
import { UserInputModule } from './../user-input/user-input.module';
import { HeaderContainerComponent } from './document-row/format-containers/header-container/header-container.component';
import { ListContainerComponent } from './document-row/format-containers/list-container/list-container.component';
import { DocumentRowComponent } from './document-row/document-row.component';
import { TreeViewModule } from '../tree/tree.module';
import { FullscreenDocumentComponent } from './fullscreen-document/fullscreen-document.component';
import { CreationRowComponent } from './document-row/creation-row/creation-row.component';
import { MaterialModule } from '../../material.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from "@angular/core";
import { DocumentViewComponent } from './document-view.component';
import { CommonModule } from "@angular/common";
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

@NgModule({
  declarations: [
    DocumentViewComponent,
    CreationRowComponent,
    DocumentRowComponent,
    FullscreenDocumentComponent,
    ListContainerComponent,
    HeaderContainerComponent,
    ColumnContainerComponent
  ],
  imports : [
    CommonModule,
    InfiniteScrollModule,
    BrowserAnimationsModule,
    BrowserModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TreeViewModule,
    UserInputModule
  ],
  exports : [
    DocumentViewComponent,
    ListContainerComponent,
  ]
})
export class DocumentViewModule {}
