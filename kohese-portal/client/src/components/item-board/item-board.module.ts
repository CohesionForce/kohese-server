import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule, MatCheckboxModule, MatCardModule, MatButtonModule,
  MatIconModule, MatTooltipModule, MatExpansionModule, MatMenuModule } from '@angular/material';

import { ItemBoardComponent } from './item-board.component';
import { DetailsModule } from '../details/details.module';
import { ObjectEditorModule } from '../object-editor/object-editor.module';

@NgModule({
  declarations: [ItemBoardComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    DetailsModule,
    ObjectEditorModule,
    MatExpansionModule
  ],
  exports: [ItemBoardComponent]
})
export class ItemBoardModule {
  public constructor() {
  }
}