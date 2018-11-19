import { Comparison, ChangeType, Property } from './comparison.class';

describe('Class: Comparison', () => {
  let comparison: Comparison;

  beforeEach(async () => {
    comparison = new Comparison({
      property: 'value'
      }, {
      property: 'Value'
    });
    await comparison.compare();
  });

  it('compares two objects', () => {
    let properties: Array<Property> = Array.from(comparison.
      propertyComparisonMap.keys());
    expect((properties).length).toBeGreaterThan(0);
    expect(comparison.propertyComparisonMap.get(properties[0]).length).
      toBeGreaterThan(0);
  });

  it('returns the change icon string for a ChangeType', () => {
    expect(Comparison.getChangeIconString(ChangeType.TYPE_CHANGED).length).
      toBeGreaterThan(0);
  });
});
