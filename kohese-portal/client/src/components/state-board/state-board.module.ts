import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule, MatCardModule, MatButtonModule, MatIconModule,
  MatTooltipModule } from '@angular/material';

import { StateBoardComponent } from './state-board.component';
import { DetailsModule } from '../details/details.module';

@NgModule({
  declarations: [StateBoardComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    DetailsModule
  ],
  exports: [StateBoardComponent]
})
export class StateBoardModule {
  public constructor() {
  }
}
