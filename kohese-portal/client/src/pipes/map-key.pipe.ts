import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'mapKey', pure: false })
export class MapKeyPipe implements PipeTransform {
  transform(value: any, args: any[] = null): any {
    return Object.keys(value);
  }
}