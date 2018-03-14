import { NgModule } from "@angular/core/";
import { DocumentViewComponent } from './document-view.component';
import { CommonModule } from "@angular/common";
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@NgModule({
  declarations: [
    DocumentViewComponent
  ],
  imports : [
    CommonModule,
    InfiniteScrollModule
  ],
  exports : [
    DocumentViewComponent
  ]
})
export class DocumentViewModule {}
