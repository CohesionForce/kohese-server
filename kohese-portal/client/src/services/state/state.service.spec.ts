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


import { StateService } from './state.service';
import { MockDataModel } from '../../../mocks/data/MockDataModel';
import { MockItem } from '../../../mocks/data/MockItem';
import { MockKoheseType } from '../../../mocks/data/MockKoheseType';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { KoheseModel } from '../../../../common/src/KoheseModel';
import { ItemRepository } from '../item-repository/item-repository.service';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { DynamicTypesService } from '../dynamic-types/dynamic-types.service';

describe('StateService', () => {
  let stateService: StateService;
  let proxy: ItemProxy;

  beforeAll(() => {
    let mockItemRepository = new MockItemRepository() as any as ItemRepository;
    let dynamicTypesServicePlaceholder = new DynamicTypesService(mockItemRepository);
    stateService = new StateService(dynamicTypesServicePlaceholder);

    proxy = new ItemProxy('Action', MockItem());
  });

  it('The data structure returned by the getTransitionCandidates function is' +
     ' correct.', () => {
    let transitionCandidates: any = stateService.getTransitionCandidates(proxy);
    expect(Object.keys(transitionCandidates).length).toEqual(2);
    expect(Object.keys(transitionCandidates['actionState']).length).toEqual(1);
    expect(Object.keys(transitionCandidates['decisionState']).length).
      toEqual(3);
  });
});
