import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapKeyPipe } from './map-key.pipe';
import { HighlightRegexPipe } from './highlight.pipe';
import { OrderByPipe } from './orderBy.pipe';
import { FilterPipe } from './filter.pipe';
import { SanitizeHtmlPipe } from './sanitizeHtml.pipe';

@NgModule({
  declarations: [
    MapKeyPipe,
    HighlightRegexPipe,
    OrderByPipe,
    FilterPipe,
    SanitizeHtmlPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    MapKeyPipe,
    HighlightRegexPipe,
    OrderByPipe,
    FilterPipe,
    SanitizeHtmlPipe
  ]
})
export class PipesModule {}
