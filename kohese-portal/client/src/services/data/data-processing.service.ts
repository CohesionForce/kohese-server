/*
 * Copyright (c) 2021 CohesionForce inc. | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import { Injectable } from '@angular/core';

@Injectable()
export class DataProcessingService {
  constructor() {
  }

  filter<T>(array: Array<T>, criteria: Array<(value: T) => boolean>): Array<T> {
    let filteredArray: Array<T> = [];
    for (let j = 0; j < array.length; j++) {
      let passes: boolean = true;
      for (let k = 0; k < criteria.length; k++) {
        if (!criteria[k](array[j])) {
          passes = false;
          break;
        }
      }

      if (passes) {
        filteredArray.push(array[j]);
      }
    }

    return filteredArray;
  }

  sort<T>(array: Array<T>, properties: Array<string>, ascending: boolean) {
    let sortedArray: Array<T> = array;
    for (let j = 0; j < properties.length; j++) {
      sortedArray = sortedArray.sort((first: T, second: T) => {
        let firstValue: any = first[properties[j]];
        let secondValue: any = second[properties[j]];
        let comparison: number = 0;
        if (typeof firstValue === 'number') {
          let difference: number = +firstValue - +secondValue;
          comparison = ((difference > 0) ? 1 : (difference < 0 ? -1 : 0));
        } else {
          let firstString: string = JSON.stringify(firstValue);
          let secondString: string = JSON.stringify(secondValue);
          if (firstString > secondString) {
            comparison = 1;
          } else if (firstString < secondString) {
            comparison = -1;
          }
        }

        if (!ascending) {
          comparison = -comparison;
        }

        return comparison;
      });
    }

    return sortedArray;
  }
}
