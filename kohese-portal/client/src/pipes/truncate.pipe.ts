import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 25, completeWords = false, ellipsis = '...') {
    if (!value || (value === '') || (value.length <= limit)) {
      return value;
    }
    
    if (completeWords) {
      limit = value.substr(0, 13).lastIndexOf(' ');
    }
    return `${value.substr(0, limit)}${ellipsis}`;
  }
}
