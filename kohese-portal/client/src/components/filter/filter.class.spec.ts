import { Filter } from './filter.class';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { KoheseModel } from '../../../../common/src/KoheseModel';
import { KoheseType } from '../../classes/UDT/KoheseType.class';
import { MockDataModel } from '../../../mocks/data/MockDataModel';
import { MockViewData } from '../../../mocks/data/MockViewData';
import { MockItem } from '../../../mocks/data/MockItem';

describe('Class: Filter', () => {
  let filter: Filter;
  let koheseType: KoheseType;
  let proxy: ItemProxy;
  
  beforeEach(() => {
    filter = new Filter();
    koheseType = new KoheseType(new KoheseModel(MockDataModel()),
      new ItemProxy('KoheseView', MockViewData()));
    KoheseModel.modelDefinitionLoadingComplete();
    proxy = new ItemProxy('Item', MockItem());
  });
  
  it('filters based on type', () => {
    filter.types.push(koheseType);
    expect(filter.filter([proxy]).indexOf(proxy)).toEqual(-1);
    proxy.model.type = koheseType;
    expect(filter.filter([proxy]).indexOf(proxy)).not.toEqual(-1);
  });

  it('filters based on the content of specific properties', () => {
    filter.types.push(koheseType);
    proxy.model.type = koheseType;
    let propertyId: string = Object.keys(koheseType.dataModelProxy.item.
      properties)[0];
    filter.properties.push(propertyId);
    filter.content = proxy.item[propertyId];
    expect(filter.filter([proxy]).indexOf(proxy)).not.toEqual(-1);
    filter.content = 'John';
    expect(filter.filter([proxy]).indexOf(proxy)).toEqual(-1);
  });

  it('filters based on whether there is a version control status',
    () => {
    filter.hasUncommittedChanges = true;
    expect(filter.filter([proxy]).indexOf(proxy)).toEqual(-1);
    proxy.status['Status'] = 'Hezekiah';
    expect(filter.filter([proxy]).indexOf(proxy)).not.toEqual(-1);
  });

  it('filters based on whether there are unsaved changes', () => {
    filter.hasUnsavedChanges = true;
    expect(filter.filter([proxy]).indexOf(proxy)).toEqual(-1);
    proxy.dirty = true;
    expect(filter.filter([proxy]).indexOf(proxy)).not.toEqual(-1);
  });

  it('filters based on the content of any property', () => {
    filter.content = 'Joshua';
    expect(filter.filter([proxy]).indexOf(proxy)).toEqual(-1);
    proxy.item.description = 'Zechariah Joshua Luke';
    expect(filter.filter([proxy]).indexOf(proxy)).not.toEqual(-1);
  });
});