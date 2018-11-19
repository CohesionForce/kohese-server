import { DynamicTypesService } from './dynamic-types.service';
import { RepoStates,
  TreeConfigType } from '../item-repository/item-repository.service';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { KoheseModel } from '../../../../common/src/KoheseModel';
import { MockDataModel } from '../../../mocks/data/MockDataModel';
import { MockViewData } from '../../../mocks/data/MockViewData';
import { of as ObservableOf } from 'rxjs';

describe('DynamicTypesService', () => {
  let typeService: DynamicTypesService;

  beforeAll(() => {
    let itemRepositoryPlaceholder: any = jasmine.createSpyObj('ItemRepository',
      ['getRepoStatusSubject', 'getProxyFor', 'getTreeConfig']);
    itemRepositoryPlaceholder.getRepoStatusSubject.and.returnValue(
      ObservableOf({
      state: RepoStates.SYNCHRONIZATION_SUCCEEDED
    }));

    let modelProxy = new KoheseModel(MockDataModel());
    KoheseModel.modelDefinitionLoadingComplete();

    itemRepositoryPlaceholder.getProxyFor.and
        .returnValues(ItemProxy.getWorkingTree()
          .getProxyFor('Model-Definitions'), new ItemProxy('KoheseView',
                                                         MockViewData()));

    itemRepositoryPlaceholder.getTreeConfig.and.returnValue(ObservableOf({
      config: TreeConfiguration.getWorkingTree(),
      configType: TreeConfigType.DEFAULT
    }));

    typeService = new DynamicTypesService(itemRepositoryPlaceholder);
  });

  it('adds each KoheseType to its associated data model ItemProxy', () => {
    expect(ItemProxy.getWorkingTree().getProxyFor('Item').type).toBeDefined();
  });
});
