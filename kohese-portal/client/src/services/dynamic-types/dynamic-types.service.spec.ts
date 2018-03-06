import { DynamicTypesService } from './dynamic-types.service';
import { RepoStates } from '../item-repository/item-repository.service';
import * as ItemProxy from '../../../../common/src/item-proxy';
import { MockDataModel } from '../../../mocks/data/MockDataModel';
import { MockViewData } from '../../../mocks/data/MockViewData';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

describe('DynamicTypesService', () => {
  let itemRepositoryPlaceholder: any = jasmine.createSpyObj('ItemRepository',
    ['getRepoStatusSubject', 'getProxyFor']);
  itemRepositoryPlaceholder.getRepoStatusSubject.and.returnValue(Observable.
    of({
    state: RepoStates.SYNCHRONIZATION_SUCCEEDED
  }));
  ItemProxy.loadModelDefinitions({
    Item: MockDataModel
  });
  itemRepositoryPlaceholder.getProxyFor.and.returnValues(ItemProxy.getProxyFor(
    'Model-Definitions'), new ItemProxy('KoheseView', MockViewData));
  let typeService: DynamicTypesService = new DynamicTypesService(
    itemRepositoryPlaceholder);
  
  it('adds each KoheseType to its associated data model ItemProxy', () => {
    expect(ItemProxy.getProxyFor('Item').type).toBeDefined();
  });
});