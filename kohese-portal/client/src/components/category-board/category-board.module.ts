import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule, MatCheckboxModule, MatCardModule, MatButtonModule,
  MatIconModule, MatTooltipModule } from '@angular/material';

import { CategoryBoardComponent } from './category-board.component';
import { DetailsModule } from '../details/details.module';
import { ObjectEditorModule } from '../object-editor/object-editor.module';

@NgModule({
  declarations: [CategoryBoardComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    DetailsModule,
    ObjectEditorModule
  ],
  exports: [CategoryBoardComponent]
})
export class CategoryBoardModule {
  public constructor() {
  }
}
