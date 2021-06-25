/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
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


import { ApplicationLens } from '../../src/services/lens-service/lens.service'
import { BehaviorSubject, Observable } from 'rxjs';

export class MockLensService {
  lensSubject: BehaviorSubject<ApplicationLens> = new BehaviorSubject<ApplicationLens>(ApplicationLens.DEFAULT)

  constructor() {

  }

  setLens(newLens: ApplicationLens) {
    this.lensSubject.next(newLens);
  }

  getLensSubject(): Observable<ApplicationLens> {
    return this.lensSubject;
  }

  resetService () : void {
    this.lensSubject = new BehaviorSubject<ApplicationLens>(ApplicationLens.DEFAULT);
  }
}
