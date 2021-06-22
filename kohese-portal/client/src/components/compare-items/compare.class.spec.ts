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


import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { Compare } from './compare.class';
import { Comparison } from './comparison.class';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('Class: Compare', () => {
  let mockItemRepository = new MockItemRepository() as any as ItemRepository;
  let dynamicTypesServicePlaceholder = new DynamicTypesService(mockItemRepository);

  it('compares two commits', async () => {
    let comparisons: Array<Comparison> = await Compare.compareCommits(
      '7ef7525795a5c370b0abfa501ab87324f5ce5908',
      '42a8e801f9efef73db114730d5819997e38916d7',
      dynamicTypesServicePlaceholder);
    expect(comparisons.length).toBeGreaterThan(0);
  });
});
