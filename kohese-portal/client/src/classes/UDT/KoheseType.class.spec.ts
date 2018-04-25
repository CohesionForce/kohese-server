import { MockDataModel, ItemSubclass } from '../../../mocks/data/MockDataModel';
import { MockItemSubclassView } from '../../../mocks/data/MockViewData';
import { KoheseType } from './KoheseType.class';
import * as ItemProxy from '../../../../common/src/item-proxy';

describe('Class: KoheseType', () => {
  let koheseType: KoheseType;
  
  beforeEach(() => {
    new ItemProxy('KoheseModel', MockDataModel());
    koheseType = new KoheseType(new ItemProxy('KoheseModel',
      ItemSubclass()), {
      'ItemSubclass': new ItemProxy('KoheseView', MockItemSubclassView())
    });
  });

  it('fields is ordered by the most root type of the type hierarchy', () => {
    let propertyNames: Array<string> = Object.keys(koheseType.fields);
    let nameIndex: number = propertyNames.indexOf('name');
    expect(nameIndex).toBeGreaterThan(-1);
    expect(nameIndex).toBeLessThan(propertyNames.indexOf('subclassProperty'));
  });
  
  it('adds properties to types', () => {
    let propertyId: string = 'Kurios Iesous';
    koheseType.addProperty(propertyId);
    expect(koheseType.dataModelProxy.item.properties[propertyId]).
      toBeDefined();
    expect(koheseType.viewModelProxy.item.viewProperties[propertyId]).
      toBeDefined();
    expect(koheseType.fields[propertyId]).toBeDefined();
  });
  
  it('deletes properties of types', () => {
    let propertyId: string = 'subclassProperty';
    koheseType.deleteProperty(propertyId);
    expect(koheseType.dataModelProxy.item.properties[propertyId]).not.
      toBeDefined();
    expect(koheseType.viewModelProxy.item.viewProperties[propertyId]).not.
      toBeDefined();
    expect(koheseType.fields[propertyId]).not.toBeDefined();
  });
  
  it('updates properties of types', () => {
    let propertyId: string = 'subclassProperty';
    let property: any = koheseType.fields[propertyId];
    property.default = 'Kurios Iesous';
    property.views['form'].displayName = 'Kurios Iesous';
    koheseType.updateProperty(propertyId, property);
    
    expect(koheseType.dataModelProxy.item.properties[propertyId].default).
      toEqual('Kurios Iesous');
    expect(koheseType.viewModelProxy.item.viewProperties[propertyId].
      displayName).toEqual('Kurios Iesous');
    expect(koheseType.fields[propertyId].default).toEqual(
      'Kurios Iesous');
    expect(koheseType.fields[propertyId].views['form'].displayName).toEqual(
      'Kurios Iesous');
  });
});