import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlightRegex'
})

export class HighlightPipe implements PipeTransform {

  // TODO - implement highlight transform
  transform(pipedValue) {
    return pipedValue;
  }
}
