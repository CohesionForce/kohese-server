import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapKeyPipe } from './map-key.pipe';
import { HighlightRegexPipe } from './highlight.pipe';
import { SanitizeHtmlPipe } from './sanitizeHtml.pipe';

@NgModule({
  declarations: [
    MapKeyPipe,
    HighlightRegexPipe,
    SanitizeHtmlPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    MapKeyPipe,
    HighlightRegexPipe,
    SanitizeHtmlPipe
  ]
})
export class PipesModule {}
