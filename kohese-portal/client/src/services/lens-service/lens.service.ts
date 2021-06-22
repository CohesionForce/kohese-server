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
import { Observable ,  BehaviorSubject } from 'rxjs';
import { ItemRepository, TreeConfigType } from '../item-repository/item-repository.service';

@Injectable()
export class LensService {
  lensSubject: BehaviorSubject<ApplicationLens> = new BehaviorSubject<ApplicationLens>(ApplicationLens.DEFAULT)
  constructor(private itemRepository: ItemRepository) {

  }

  setLens(newLens: ApplicationLens) {
    if (newLens === ApplicationLens.DEFAULT) {
      this.itemRepository.setTreeConfig('Unstaged', TreeConfigType.DEFAULT);
    }
    this.lensSubject.next(newLens);
  }

  getLensSubject(): Observable<ApplicationLens> {
    return this.lensSubject;
  }
}

export enum ApplicationLens {
  DEFAULT,
  HISTORY,
  BRANCH,
  SPHERE,

}

