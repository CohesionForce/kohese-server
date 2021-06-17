import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';

import { ItemBoardComponent } from './item-board.component';
import { DetailsModule } from '../details/details.module';
import { ObjectEditorModule } from '../object-editor/object-editor.module';
import { DirectivesModule } from '../../directives/directives.module'
@NgModule({
  declarations: [ItemBoardComponent],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    DetailsModule,
    ObjectEditorModule,
    DirectivesModule
  ],
  exports: [ItemBoardComponent]
})
export class ItemBoardModule {
  public constructor() {
  }
}
