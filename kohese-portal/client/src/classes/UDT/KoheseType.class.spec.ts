import { ItemSubclass } from '../../../mocks/data/MockDataModel';
import { MockViewData } from '../../../mocks/data/MockViewData';
import { KoheseType } from './KoheseType.class';
import * as ItemProxy from '../../../../common/src/item-proxy';

describe('Class: KoheseType', () => {
  let koheseType: KoheseType;
  
  beforeEach(() => {
    koheseType = new KoheseType(new ItemProxy('KoheseModel',
      ItemSubclass()), {
      'KoheseView': new ItemProxy('KoheseView', MockViewData())
    });
  });

  it('fields is ordered by the most root type of the type hierarchy', () => {
    pending('Awaiting production code changes related to KoheseModels');
    let propertyNames: Array<string> = Object.keys(koheseType.fields);
    let nameIndex: number = propertyNames.indexOf('name');
    expect(nameIndex).toBeGreaterThan(-1);
    expect(nameIndex).toBeLessThan(propertyNames.indexOf('subclassProperty'));
  });
});