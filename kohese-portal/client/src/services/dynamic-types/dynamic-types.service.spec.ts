import { DynamicTypesService } from './dynamic-types.service';
import { RepoStates } from '../item-repository/item-repository.service';
import * as ItemProxy from '../../../../common/src/item-proxy';
import * as KoheseModel from '../../../../common/src/KoheseModel';
import { MockDataModel } from '../../../mocks/data/MockDataModel';
import { MockViewData } from '../../../mocks/data/MockViewData';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

describe('DynamicTypesService', () => {
  let typeService: DynamicTypesService;

  beforeAll(() => {
    let itemRepositoryPlaceholder: any = jasmine.createSpyObj('ItemRepository',
      ['getRepoStatusSubject', 'getProxyFor', 'getTreeConfig']);
    itemRepositoryPlaceholder.getRepoStatusSubject.and.returnValue(Observable.
      of({
      state: RepoStates.SYNCHRONIZATION_SUCCEEDED
    }));

    let modelProxy = new KoheseModel(MockDataModel());
    KoheseModel.modelDefinitionLoadingComplete();

    itemRepositoryPlaceholder.getProxyFor.and
        .returnValues(ItemProxy.getWorkingTree()
          .getProxyFor('Model-Definitions'), new ItemProxy('KoheseView',
                                                         MockViewData()));
    
    itemRepositoryPlaceholder.getTreeConfig.and.returnValue(Observable.of(
      ItemProxy.TreeConfiguration.getWorkingTree()));
    
    typeService = new DynamicTypesService(itemRepositoryPlaceholder);
  });

  it('adds each KoheseType to its associated data model ItemProxy', () => {
    expect(ItemProxy.getWorkingTree().getProxyFor('Item').type).toBeDefined();
  });
});
