import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { Compare } from './compare.class';
import { Comparison } from './comparison.class';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('Class: Compare', () => {
  let mockItemRepository = new MockItemRepository() as unknown as ItemRepository;
  let dynamicTypesServicePlaceholder = new DynamicTypesService(mockItemRepository);

  it('compares two commits', async () => {
    let comparisons: Array<Comparison> = await Compare.compareCommits(
      '7ef7525795a5c370b0abfa501ab87324f5ce5908',
      '42a8e801f9efef73db114730d5819997e38916d7',
      dynamicTypesServicePlaceholder);
    expect(comparisons.length).toBeGreaterThan(0);
  });
});
