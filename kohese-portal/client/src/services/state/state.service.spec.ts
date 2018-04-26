import { StateService } from './state.service';
import { DynamicTypesService } from '../dynamic-types/dynamic-types.service';
import { MockDataModel } from '../../../mocks/data/MockDataModel';
import { MockItem } from '../../../mocks/data/MockItem';
import { MockKoheseType } from '../../../mocks/data/MockKoheseType';
import * as ItemProxy from '../../../../common/src/item-proxy';
import * as KoheseModel from '../../../../common/src/KoheseModel';

describe('StateService', () => {
  let stateService: StateService;
  let proxy: ItemProxy;
  
  beforeAll(() => {
    let typeServicePlaceholder: any = jasmine.createSpyObj('DynamicTypesService',
      ['getKoheseTypes']);
    typeServicePlaceholder.getKoheseTypes.and.returnValue({
      Item: MockKoheseType()
    });
    stateService = new StateService(typeServicePlaceholder);
    new KoheseModel(MockDataModel());
    KoheseModel.modelDefinitionLoadingComplete();
    proxy = new ItemProxy('Item', MockItem());
  });

  it('The data structure returned by the getTransitionCandidates function is' +
     ' correct.', () => {
    let transitionCandidates: any = stateService.getTransitionCandidates(proxy);
    expect(Object.keys(transitionCandidates).length).toEqual(2);
    expect(transitionCandidates['actionState'].length).toEqual(1);
    expect(transitionCandidates['decisionState'].length).toEqual(3);
  });
});
