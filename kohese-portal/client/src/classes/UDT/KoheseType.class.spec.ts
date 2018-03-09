import { ItemSubclass } from '../../../mocks/data/MockDataModel';
import { MockViewData } from '../../../mocks/data/MockViewData';
import { KoheseType } from './KoheseType.class';
import * as ItemProxy from '../../../../common/src/item-proxy';

describe('Class: KoheseType', () => {
  it('dataModelFields is ordered by the most root type of the type hierarchy',
    () => {
    let type: KoheseType = new KoheseType(new ItemProxy('KoheseModel',
      ItemSubclass()), new ItemProxy('KoheseModel', MockViewData()));
    let dataModelFieldKeys: Array<string> = Object.keys(type.dataModelFields);
    expect(dataModelFieldKeys.indexOf('name')).toBeLessThan(dataModelFieldKeys.
      indexOf('subclassProperty'));
  });
});