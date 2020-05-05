import { MockDynamicTypesService } from '../../../mocks/services/MockDynamicTypesService';
import { Compare } from './compare.class';
import { Comparison } from './comparison.class';

describe('Class: Compare', () => {
  it('compares two commits', async () => {
    let dynamicTypesServicePlaceholder : any = new MockDynamicTypesService();
    let comparisons: Array<Comparison> = await Compare.compareCommits(
      '7ef7525795a5c370b0abfa501ab87324f5ce5908',
      '42a8e801f9efef73db114730d5819997e38916d7',
      dynamicTypesServicePlaceholder);
    expect(comparisons.length).toBeGreaterThan(0);
  });
});
