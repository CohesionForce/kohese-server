import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapKeyPipe } from './map-key.pipe';
import { HighlightRegexPipe } from './highlight.pipe';

@NgModule({
  declarations: [
    MapKeyPipe,
    HighlightRegexPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    MapKeyPipe,
    HighlightRegexPipe
  ]
})
export class PipesModule {}
