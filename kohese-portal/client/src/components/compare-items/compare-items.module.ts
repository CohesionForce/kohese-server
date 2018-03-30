import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AngularSplitModule } from 'angular-split';

import { MaterialModule } from '../../material.module';
import { UserInputModule } from '../user-input/user-input.module';
import { DetailsModule } from '../details/details.module';
import { CompareItemsComponent } from './compare-items.component';

@NgModule({
  declarations: [
    CompareItemsComponent
  ],
  entryComponents: [
    CompareItemsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AngularSplitModule,
    MaterialModule,
    UserInputModule,
    DetailsModule
  ]
})
export class CompareItemsModule {
}