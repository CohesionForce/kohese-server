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


import { DynamicTypesService } from './dynamic-types.service';
import { ItemRepository } from '../item-repository/item-repository.service';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { MockItemRepository } from '../../../../client/mocks/services/MockItemRepository';

describe('DynamicTypesService', () => {
  let typeService: DynamicTypesService;

  beforeAll(() => {
    let itemRepositoryPlaceholder = new MockItemRepository as any as ItemRepository;
    typeService = new DynamicTypesService(itemRepositoryPlaceholder);
  });

  it('adds each KoheseType to its associated data model ItemProxy', () => {
    expect(ItemProxy.getWorkingTree().getProxyFor('Item').type).toBeDefined();
  });
});
