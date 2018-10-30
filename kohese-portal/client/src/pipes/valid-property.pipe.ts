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
    let validProperties = [];
    for (let propertyName of value) {
      let propInfo = data.property.inputOptions;
      if (propInfo && propInfo.options.asTable) {
        if (data.container.kind != 'list') {
          continue;
        }
      };
      validProperties.push(propertyName);
    }
    return validProperties;
  }
}
