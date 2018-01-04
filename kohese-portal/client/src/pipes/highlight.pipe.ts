import { Pipe } from '@angular/core';
import { PipeTransform } from '@angular/core/src/change_detection/pipe_transform';

@Pipe({
  name: 'highlightRegex'
})

export class HighlightRegexPipe implements PipeTransform {

  // TODO - implement highlight transform
  transform(pipedValue) {
    return pipedValue;
  }
}
