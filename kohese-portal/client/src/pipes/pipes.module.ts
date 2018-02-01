import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapKeyPipe } from './map-key.pipe';
import { HighlightRegexPipe } from './highlight.pipe';
import { SanitizeHtmlPipe } from './sanitizeHtml.pipe';
import { TruncatePipe } from './truncate.pipe';

@NgModule({
  declarations: [
    MapKeyPipe,
    HighlightRegexPipe,
    SanitizeHtmlPipe,
    TruncatePipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    MapKeyPipe,
    HighlightRegexPipe,
    SanitizeHtmlPipe,
    TruncatePipe
  ]
})
export class PipesModule {}
