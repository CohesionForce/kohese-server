import { StateService } from './state.service';
import { MockDataModel } from '../../../mocks/data/MockDataModel';
import { MockItem } from '../../../mocks/data/MockItem';
import { MockKoheseType } from '../../../mocks/data/MockKoheseType';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { KoheseModel } from '../../../../common/src/KoheseModel';
import { ItemRepository } from '../item-repository/item-repository.service';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { DynamicTypesService } from '../dynamic-types/dynamic-types.service';

describe('StateService', () => {
  let stateService: StateService;
  let proxy: ItemProxy;

  beforeAll(() => {
    let mockItemRepository = new MockItemRepository() as unknown as ItemRepository;
    let dynamicTypesServicePlaceholder = new DynamicTypesService(mockItemRepository);
    stateService = new StateService(dynamicTypesServicePlaceholder);

    proxy = new ItemProxy('Action', MockItem());
  });

  it('The data structure returned by the getTransitionCandidates function is' +
     ' correct.', () => {
    let transitionCandidates: any = stateService.getTransitionCandidates(proxy);
    expect(Object.keys(transitionCandidates).length).toEqual(2);
    expect(Object.keys(transitionCandidates['actionState']).length).toEqual(1);
    expect(Object.keys(transitionCandidates['decisionState']).length).
      toEqual(3);
  });
});
