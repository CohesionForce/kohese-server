import {
  Pipe,
  PipeTransform
} from '@angular/core';

@Pipe({
  name: 'validProperty'
})
export class ValidPropertyPipe implements PipeTransform {
  transform(value: string, data: any) {
    console.log(value, data);
    const validProperties = [];
    if (data.container.kind === 'list') {
      for (const propertyName of value) {
        validProperties.push(propertyName);
      }
    }
    
    return validProperties;
  }
}
