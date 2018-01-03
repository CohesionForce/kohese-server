import { NgModule } from "@angular/core/";
import { DocumentViewComponent } from './document-view.component';
import { CommonModule } from "@angular/common";

@NgModule({
  declarations: [
    DocumentViewComponent
  ],
  imports : [
    CommonModule
  ],
  exports : [
    DocumentViewComponent
  ]
})
export class DocumentViewModule {}
