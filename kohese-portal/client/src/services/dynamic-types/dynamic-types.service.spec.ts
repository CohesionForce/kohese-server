import { DynamicTypesService } from './dynamic-types.service';
import { ItemRepository } from '../item-repository/item-repository.service';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { MockItemRepository } from '../../../../client/mocks/services/MockItemRepository';

describe('DynamicTypesService', () => {
  let typeService: DynamicTypesService;

  beforeAll(() => {
    let itemRepositoryPlaceholder = new MockItemRepository as any as ItemRepository;
    typeService = new DynamicTypesService(itemRepositoryPlaceholder);
  });

  it('adds each KoheseType to its associated data model ItemProxy', () => {
    expect(ItemProxy.getWorkingTree().getProxyFor('Item').type).toBeDefined();
  });
});
