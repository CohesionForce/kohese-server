import { BehaviorSubject} from 'rxjs/BehaviorSubject';
import { MockItem, MockRoot } from '../data/MockItem';
import { MockViewData } from '../data/MockViewData';
import { MockDataModel } from '../data/MockDataModel';
import * as ItemProxy from '../../../common/src/item-proxy';
import * as KoheseModel from '../../../common/src/KoheseModel';
import { Subject } from 'rxjs';
import { RepoStates } from '../../src/services/item-repository/item-repository.service';

export class MockItemRepository {
  mockRootProxy = ItemProxy.getRootProxy();
  state : any;

  constructor() {

    let modelProxy = new KoheseModel(MockDataModel());
    KoheseModel.modelDefinitionLoadingComplete();


    this.mockRootProxy.children = [
      new ItemProxy('Item', MockViewData()),
      new ItemProxy('Item', MockItem()),
      new ItemProxy('Item', MockItem()),
      new ItemProxy('Item', MockItem()),
      new ItemProxy('Item', MockItem())
    ]
    this.mockRootProxy.visitChildren = ()=>{}
  }

  getRepoStatusSubject () {
    return new BehaviorSubject<any>({state : RepoStates.SYNCHRONIZATION_SUCCEEDED})
  }

  getRootProxy () {
    return this.mockRootProxy;
  }

  getHistoryFor () {
    return (new Subject())
  }

  getProxyFor (id: string) {
    if(id === 'PersistedModel') {
      return undefined;
    }
    return new ItemProxy('Item', MockItem());
  }

  getRecentProxies () {
    return [
      new ItemProxy('Item', MockItem()),
      new ItemProxy('Item', MockItem()),
      new ItemProxy('Item', MockItem())
    ]
  }

  buildItem() {

  }

  registerRecentProxy() {

  }

  getShortFormItemList () {

  }

  getRepositories () {

  }

  deleteItem () {

  }

  upsertItem() {

  }
}
