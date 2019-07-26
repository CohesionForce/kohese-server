import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';

import { MaterialModule } from '../../material.module';
import { UserInputModule } from '../user-input/user-input.module';
import { TreeViewModule } from '../tree/tree.module';
import { ImportComponent } from './import.component';
import { ParameterSpecifierComponent } from './parameter-specifier/parameter-specifier.component';

@NgModule({
  declarations: [
    ImportComponent,
    ParameterSpecifierComponent
  ],
  entryComponents: [
    ImportComponent,
    ParameterSpecifierComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MarkdownModule,
    MaterialModule,
    UserInputModule,
    TreeViewModule
  ]
})
export class ImportModule {
  public constructor() {
  }
}
