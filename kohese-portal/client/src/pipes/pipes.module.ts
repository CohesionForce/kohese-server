import { ValidPropertyPipe } from './valid-property.pipe';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapKeyPipe } from './map-key.pipe';
import { HighlightPipe } from './highlight.pipe';
import { SanitizeHtmlPipe } from './sanitizeHtml.pipe';
import { TruncatePipe } from './truncate.pipe';

@NgModule({
  declarations: [
    MapKeyPipe,
    HighlightPipe,
    SanitizeHtmlPipe,
    TruncatePipe,
    ValidPropertyPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    MapKeyPipe,
    HighlightPipe,
    SanitizeHtmlPipe,
    TruncatePipe,
    ValidPropertyPipe
  ]
})
export class PipesModule {}
