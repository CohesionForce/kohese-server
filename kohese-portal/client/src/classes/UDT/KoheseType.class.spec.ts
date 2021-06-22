/*
 * Copyright (c) 2021 CohesionForce inc. | www.CohesionForce.com | info@CohesionForce.com
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


import { MockDataModel, ItemSubclass } from '../../../mocks/data/MockDataModel';
import { MockViewData,
  MockItemSubclassView } from '../../../mocks/data/MockViewData';
import { KoheseType } from './KoheseType.class';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { KoheseModel } from '../../../../common/src/KoheseModel';

describe('Class: KoheseType', () => {
  let koheseType: KoheseType;

  beforeEach(() => {
    new KoheseModel(MockDataModel());
    koheseType = new KoheseType(new KoheseModel(ItemSubclass()), {
      'Item': new ItemProxy('KoheseView', MockViewData()),
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
    let propertyId: string = 'propertyId';
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
    let defaultValue: string = 'default';
    property.default = defaultValue;
    let displayNameValue: string = 'displayName';
    property.views['form'].displayName = displayNameValue;
    koheseType.updateProperty(propertyId, property);

    expect(koheseType.dataModelProxy.item.properties[propertyId].default).
      toEqual(defaultValue);
    expect(koheseType.viewModelProxy.item.viewProperties[propertyId].
      displayName).toEqual(displayNameValue);
    expect(koheseType.fields[propertyId].default).toEqual(
      defaultValue);
    expect(koheseType.fields[propertyId].views['form'].displayName).toEqual(
      displayNameValue);
  });

  it('sets the "form" view for superclass properties', () => {
    expect(koheseType.fields['name'].views['form']).toBeDefined();
  });
});
