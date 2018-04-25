import { ItemSubclass } from '../../../mocks/data/MockDataModel';
import { MockViewData } from '../../../mocks/data/MockViewData';
import { KoheseType } from './KoheseType.class';
import { ItemProxy } from '../../../../common/src/item-proxy';

describe('Class: KoheseType', () => {
  it('dataModelFields is ordered by the most root type of the type hierarchy',
    () => {
    pending('Awaiting production code changes related to KoheseModels');
    let type: KoheseType = new KoheseType(new ItemProxy('KoheseModel',
      ItemSubclass()), new ItemProxy('KoheseView', MockViewData()));
    let dataModelFieldKeys: Array<string> = Object.keys(type.dataModelFields);
    let nameIndex: number = dataModelFieldKeys.indexOf('name');
    expect(nameIndex).toBeGreaterThan(-1);
    expect(nameIndex).toBeLessThan(dataModelFieldKeys.
      indexOf('subclassProperty'));
  });
});
