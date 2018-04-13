import { BehaviorSubject} from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { MockItem, MockRoot } from '../data/MockItem';
import { MockViewData } from '../data/MockViewData';
import { MockDataModel } from '../data/MockDataModel';
import * as ItemProxy from '../../../common/src/item-proxy';
import * as KoheseModel from '../../../common/src/KoheseModel';
import { RepoStates } from '../../src/services/item-repository/item-repository.service';

export class MockItemRepository {
  mockRootProxy = ItemProxy.getWorkingTree().getRootProxy();
  state : any;

  constructor() {

    let modelProxy = new KoheseModel(MockDataModel());
    KoheseModel.modelDefinitionLoadingComplete();

    new ItemProxy('KoheseView', MockViewData());
    let numberOfItemsToAdd: number = 7;
    for (let j: number = 0; j < numberOfItemsToAdd; j++) {
      let item: any = MockItem();
      /* Delete the parentId so that this Item will be added as a child of the
      root proxy */
      delete item.parentId;
      // Make the ID of each of these added Items distinct among each other
      item.id = item.id + (j + 1);
      new ItemProxy('Item', item);
    }
  }

  getRepoStatusSubject () {
    return new BehaviorSubject<any>({state : RepoStates.SYNCHRONIZATION_SUCCEEDED})
  }

  getRootProxy () {
    return this.mockRootProxy;
  }

  public getHistoryFor(proxy: ItemProxy): Observable<Array<any>> {
    let historyObject: any = {
      author: 'Kurios Iesous',
      commit: 'Kurios Iesous',
      message: 'Kurios Iesous.',
      date: 0
    };
    proxy.history = [historyObject];
    return Observable.of(JSON.parse(JSON.stringify(proxy.history)));
  }

  getProxyFor (id: string) {
    return ItemProxy.getProxyFor(id);
  }

  getRecentProxies () {
    return [
      new ItemProxy('Item', MockItem()),
      new ItemProxy('Item', MockItem()),
      new ItemProxy('Item', MockItem())
    ]
  }

  public buildItem(type: string, item: any): Promise<ItemProxy> {
    return Promise.resolve(new ItemProxy(type, item));
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

  public getChangeSubject(): Subject<any> {
    return ItemProxy.getWorkingTree().getChangeSubject();
  }

  public fetchItem(proxy: ItemProxy): Promise<ItemProxy> {
    let id: string = proxy.item.id;
    proxy.updateItem(proxy.kind, MockItem());
    proxy.item.id = id;
    return Promise.resolve(proxy);
  }
}
