import { MockDynamicTypesService } from '../../../mocks/services/MockDynamicTypesService';
import { Compare } from './compare.class';
import { Comparison } from './comparison.class';

describe('Class: Compare', () => {
  it('compares two commits', () => {
    let dynamicTypesServicePlaceholder: any = jasmine.createSpyObj(
      'dynamicTypesServicePlaceholder', ['getKoheseTypes']);
    dynamicTypesServicePlaceholder.getKoheseTypes.and.returnValue =
      new MockDynamicTypesService().getKoheseTypes();
    let comparisons: Array<Comparison> = Compare.compareCommits(
      'cca8746527cb48d3e8a815c12b99bc1cb378b9f0',
      'ccdaa0ec5f01db40886fe52e917c336eb7c075ea',
      dynamicTypesServicePlaceholder);
    expect(comparisons.length).toBeGreaterThan(0);
  });
});