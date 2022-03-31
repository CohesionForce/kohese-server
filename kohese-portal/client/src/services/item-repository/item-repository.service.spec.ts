/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
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


import { BehaviorSubject } from 'rxjs'

import { ItemRepository, TreeConfigType } from './item-repository.service';
import { KoheseDataModel,
  KoheseViewModel } from '../../../../common/src/KoheseModel.interface';
import { FormatDefinitionType } from '../../../../common/src/FormatDefinition.interface';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { ItemCache } from '../../../../common/src/item-cache';

describe('ItemRepository', () => {
  // Save ItemCache used for testing since the ItemRepository creates an empty ItemCache
  let mockItemCache = ItemCache.getItemCache();

  // Create ItemRepository with Spy
  let itemRepository: ItemRepository = new ItemRepository(
  jasmine.createSpyObj(['subscribe']),
  jasmine.createSpyObj({getCurrentUserSubject: new BehaviorSubject('')}),
  jasmine.createSpyObj(['']),
  jasmine.createSpyObj(['']),
  jasmine.createSpyObj(['']),
  jasmine.createSpyObj(['']),
  jasmine.createSpyObj(['getComponentId', 'getEventId','log']),
  jasmine.createSpyObj(['']));

  // Restore ItemCache used for testing
  ItemCache.setItemCache(mockItemCache);

  beforeEach(() => {
    new MockItemRepository();
    itemRepository.setTreeConfig('Unstaged', TreeConfigType.DEFAULT);
  });

  ///////////////////////////////////////////////////////////////////////////////
  //
  ///////////////////////////////////////////////////////////////////////////////
  it('retrieves the Markdown representation of a given object based on the ' +
    'FormatDefinition indicated by the given FormatDefinitionType', () => {
    let modelProxy = TreeConfiguration.getWorkingTree().getModelProxyFor('KoheseModel');
    let dataModel: KoheseDataModel = modelProxy.item;
    let viewModel: KoheseViewModel = modelProxy.view.item;

    ///////////////////////////////////////////////////////////////////////////////
    // console.log('*** Expect 1 >>>'+'%s', itemRepository.getMarkdownRepresentation(dataModel, undefined,
    //   dataModel, viewModel, FormatDefinitionType.DEFAULT, 0, true));

    expect(itemRepository.getMarkdownRepresentation(dataModel, undefined,
      dataModel, viewModel, FormatDefinitionType.DEFAULT, 0, true).startsWith(
      ' [KoheseModel](http://localhost:9884/explore;id=KoheseModel)\n\n')).
      toBe(true);

    ///////////////////////////////////////////////////////////////////////////////
    console.log('*** Expect 2 >>>'+'%s', itemRepository.getMarkdownRepresentation(dataModel, undefined,
      dataModel, viewModel, FormatDefinitionType.DOCUMENT, 0, true));

    expect(itemRepository.getMarkdownRepresentation(dataModel, undefined,
      dataModel, viewModel, FormatDefinitionType.DOCUMENT, 0, true).startsWith(
      '<div style="font-size: x-large;">[KoheseModel](http://localhost:9884/explore;id=KoheseModel)\n\n</div>\n\n')).
      toBe(true);

    ///////////////////////////////////////////////////////////////////////////////
    // console.log('*** Expect 3 >>>'+'%s', itemRepository.getMarkdownRepresentation(dataModel, undefined,
    //   dataModel, viewModel, FormatDefinitionType.DEFAULT, 1, false));

    expect(itemRepository.getMarkdownRepresentation(dataModel, undefined,
      dataModel, viewModel, FormatDefinitionType.DEFAULT, 1, false).startsWith(
      '# KoheseModel\n\n')).toBe(true);

    ///////////////////////////////////////////////////////////////////////////////
    // console.log('*** Expect 4 >>>'+'%s', itemRepository.getMarkdownRepresentation(dataModel, undefined,
    //   dataModel, viewModel, FormatDefinitionType.DEFAULT, 1, true));

    expect(itemRepository.getMarkdownRepresentation(dataModel, undefined,
      dataModel, viewModel, FormatDefinitionType.DEFAULT, 1, true).startsWith(
      '# [KoheseModel](http://localhost:9884/explore;id=KoheseModel)\n\n')).
      toBe(true);

    ///////////////////////////////////////////////////////////////////////////////
    console.log('*** Expect 5 >>>'+'%s', itemRepository.getMarkdownRepresentation(dataModel, undefined,
      dataModel, viewModel, FormatDefinitionType.DEFAULT, -1, true));

    expect(itemRepository.getMarkdownRepresentation(dataModel, undefined,
      dataModel, viewModel, FormatDefinitionType.DEFAULT, -1, true).startsWith(
      '[KoheseModel](http://localhost:9884/explore;id=KoheseModel)\n\n')).toBe(true);
  });

  ///////////////////////////////////////////////////////////////////////////////
  //
  ///////////////////////////////////////////////////////////////////////////////
  it('produces a string representation of the value of a given attribute of ' +
    'a given object', () => {
    let modelProxy = TreeConfiguration.getWorkingTree().getModelProxyFor('KoheseModel');
    let dataModel: KoheseDataModel = modelProxy.item;
    let viewModel: KoheseViewModel = modelProxy.view.item;

    ///////////////////////////////////////////////////////////////////////////////
    expect(itemRepository.getStringRepresentation(dataModel, 'name', undefined,
      undefined, dataModel, viewModel, FormatDefinitionType.DEFAULT)).toBe(
      'KoheseModel');

    ///////////////////////////////////////////////////////////////////////////////
    expect(itemRepository.getStringRepresentation(dataModel, 'parentId',
      undefined, undefined, dataModel, viewModel, FormatDefinitionType.
      DEFAULT)).toBe('Item');

    ///////////////////////////////////////////////////////////////////////////////
    expect(itemRepository.getStringRepresentation(dataModel,
      'booleanAttribute', undefined, undefined, dataModel, viewModel,
      FormatDefinitionType.DEFAULT)).toBe('true');

    ///////////////////////////////////////////////////////////////////////////////
    expect(itemRepository.getStringRepresentation(dataModel,
      'multivaluedBooleanAttribute', 1, undefined, dataModel, viewModel,
      FormatDefinitionType.DEFAULT)).toBe('false');

    ///////////////////////////////////////////////////////////////////////////////
    expect(itemRepository.getStringRepresentation(dataModel,
      'numberAttribute', undefined, undefined, dataModel, viewModel,
      FormatDefinitionType.DEFAULT)).toBe('3');

    ///////////////////////////////////////////////////////////////////////////////
    expect(itemRepository.getStringRepresentation(dataModel,
      'multivaluedNumberAttribute', 1, undefined, dataModel, viewModel,
      FormatDefinitionType.DEFAULT)).toBe('1');

    ///////////////////////////////////////////////////////////////////////////////
    expect(itemRepository.getStringRepresentation(dataModel,
      'timeAttribute', undefined, undefined, dataModel, viewModel,
      FormatDefinitionType.DEFAULT)).toBe('1/1/1970');

    ///////////////////////////////////////////////////////////////////////////////
    expect(itemRepository.getStringRepresentation(dataModel,
      'multivaluedTimeAttribute', 0, undefined, dataModel, viewModel,
      FormatDefinitionType.DEFAULT)).toBe('12/31/1969');

    ///////////////////////////////////////////////////////////////////////////////
    expect(itemRepository.getStringRepresentation(dataModel,
      'stateAttribute', undefined, undefined, dataModel, viewModel,
      FormatDefinitionType.DEFAULT)).toBe('First');

    ///////////////////////////////////////////////////////////////////////////////
    expect(itemRepository.getStringRepresentation(dataModel,
      'multivaluedStateAttribute', 1, undefined, dataModel, viewModel,
      FormatDefinitionType.DEFAULT)).toBe('Second');

    ///////////////////////////////////////////////////////////////////////////////
    expect(itemRepository.getStringRepresentation(dataModel,
      'usernameAttribute', undefined, undefined, dataModel, viewModel,
      FormatDefinitionType.DEFAULT)).toBe('admin');

    ///////////////////////////////////////////////////////////////////////////////
    expect(itemRepository.getStringRepresentation(dataModel,
      'multivaluedUsernameAttribute', 1, undefined, dataModel, viewModel,
      FormatDefinitionType.DEFAULT)).toBe('admin');

    ///////////////////////////////////////////////////////////////////////////////
    expect(itemRepository.getStringRepresentation(dataModel,
      'stringAttribute', undefined, undefined, dataModel, viewModel,
      FormatDefinitionType.DEFAULT)).toBe('String');

    ///////////////////////////////////////////////////////////////////////////////
    expect(itemRepository.getStringRepresentation(dataModel,
      'multivaluedStringAttribute', 1, undefined, dataModel, viewModel,
      FormatDefinitionType.DEFAULT)).toBe('String2');

    ///////////////////////////////////////////////////////////////////////////////
    expect(itemRepository.getStringRepresentation(dataModel,
      'maskedStringAttribute', undefined, undefined, dataModel, viewModel,
      FormatDefinitionType.DEFAULT)).toBe('MaskedString');

    ///////////////////////////////////////////////////////////////////////////////
    expect(itemRepository.getStringRepresentation(dataModel,
      'multivaluedMaskedStringAttribute', 1, undefined, dataModel, viewModel,
      FormatDefinitionType.DEFAULT)).toBe('MaskedString2');

    ///////////////////////////////////////////////////////////////////////////////
    expect(itemRepository.getStringRepresentation(dataModel,
      'markdownAttribute', undefined, undefined, dataModel, viewModel,
      FormatDefinitionType.DEFAULT)).toBe('**Markdown**');

    ///////////////////////////////////////////////////////////////////////////////
    expect(itemRepository.getStringRepresentation(dataModel,
      'multivaluedMarkdownAttribute', 1, undefined, dataModel, viewModel,
      FormatDefinitionType.DEFAULT)).toBe('_Markdown2_');

    ///////////////////////////////////////////////////////////////////////////////
    expect(itemRepository.getStringRepresentation(dataModel,
      'globalTypeAttribute', undefined, undefined, dataModel, viewModel,
      FormatDefinitionType.DEFAULT)).toBe('KoheseModel');

    ///////////////////////////////////////////////////////////////////////////////
    expect(itemRepository.getStringRepresentation(dataModel,
      'multivaluedGlobalTypeAttribute', 1, undefined, dataModel, viewModel,
      FormatDefinitionType.DEFAULT)).toBe('KoheseModel');

    ///////////////////////////////////////////////////////////////////////////////
    expect(itemRepository.getStringRepresentation(dataModel,
      'localTypeAttribute', undefined, undefined, dataModel, viewModel,
      FormatDefinitionType.DEFAULT)).toBe('Boolean Attribute: true');

    ///////////////////////////////////////////////////////////////////////////////
    expect(itemRepository.getStringRepresentation(dataModel,
      'multivaluedLocalTypeAttribute', 1, undefined, dataModel, viewModel,
      FormatDefinitionType.DEFAULT)).toBe('Boolean Attribute: true');

    ///////////////////////////////////////////////////////////////////////////////
    expect(itemRepository.getStringRepresentation(dataModel,
      'enumerationAttribute', undefined, undefined, dataModel, viewModel,
      FormatDefinitionType.DEFAULT)).toBe('Enumeration Value 1');

    ///////////////////////////////////////////////////////////////////////////////
    expect(itemRepository.getStringRepresentation(dataModel,
      'multivaluedEnumerationAttribute', 1, undefined, dataModel, viewModel,
      FormatDefinitionType.DEFAULT)).toBe('Enumeration Value 2');

    ///////////////////////////////////////////////////////////////////////////////
    expect(itemRepository.getStringRepresentation(dataModel,
      'variantAttribute', undefined, undefined, dataModel, viewModel,
      FormatDefinitionType.DEFAULT)).toBe('Global Type Attribute: ' +
      'KoheseModel');

    ///////////////////////////////////////////////////////////////////////////////
    expect(itemRepository.getStringRepresentation(dataModel,
      'multivaluedVariantAttribute', 1, undefined, dataModel, viewModel,
      FormatDefinitionType.DEFAULT)).toBe('Multivalued Enumeration ' +
      'Attribute:\n\nEnumeration Value 1\n\nEnumeration Value 2');
  });
});
