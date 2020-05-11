
import {of as observableOf,  BehaviorSubject ,  Observable ,  Subject } from 'rxjs';


import { MockItem } from '../data/MockItem';
import { MockViewData } from '../data/MockViewData';
import { MockDataModel, ModelDefinitions } from '../data/MockDataModel';
import { ItemProxy } from '../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../common/src/tree-configuration';
import { KoheseModel } from '../../../common/src/KoheseModel';
import { RepoStates,
  TreeConfigType } from '../../src/services/item-repository/item-repository.service';
import { KoheseType } from '../../src/classes/UDT/KoheseType.class';

export class MockItemRepository {
  static modelDefinitions = ModelDefinitions();
  static singleton = new MockItemRepository();

  mockRootProxy = ItemProxy.getWorkingTree().getRootProxy();
  state: any;

  constructor() {
    console.log('### MIR Constructor called');
    if (MockItemRepository.singleton) {
      this.syncMock();
      return MockItemRepository.singleton;
    }
    console.log('### MIR Creating singleton');
    MockItemRepository.singleton = this;
    this.syncMock();
  }

  syncMock() {

    // TODO: Uncomment the following block to switch to the full data model
    // this.syncFull();
    // return;

    TreeConfiguration.getWorkingTree().reset();
    let modelProxy = new KoheseModel(MockDataModel());
    let viewModelProxy = new ItemProxy('KoheseView', MockViewData());
    KoheseModel.modelDefinitionLoadingComplete();
    modelProxy.type = new KoheseType(modelProxy, viewModelProxy);

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
    TreeConfiguration.getWorkingTree().loadingComplete();
  }

  syncFull () {
    TreeConfiguration.getWorkingTree().reset();

    for(let modelName in MockItemRepository.modelDefinitions.model) {
      console.log('::: Loading ' + modelName);
      let modelDefn = MockItemRepository.modelDefinitions.model[modelName];
      let model = new KoheseModel(modelDefn);
    }

    for(let viewName in MockItemRepository.modelDefinitions.view) {
      console.log('::: Loading ' + viewName);
      let viewDefn = MockItemRepository.modelDefinitions.view[viewName];
      let view = new ItemProxy('KoheseView',viewDefn)
    }

    KoheseModel.modelDefinitionLoadingComplete();

    // Mock the effect of KoheseType
    let working = ItemProxy.getWorkingTree();
    for(let modelName in MockItemRepository.modelDefinitions.model) {
      let modelProxy : KoheseModel = (working.getProxyFor(modelName)) as KoheseModel;
      let viewId = 'view-' + modelName.toLowerCase();
      let viewProxy = working.getProxyFor(viewId);
      modelProxy.type = new KoheseType(modelProxy, viewProxy);
    }

    let numberOfItemsToAdd: number = 7;
    for (let j: number = 0; j < numberOfItemsToAdd; j++) {
      let item: any = MockItem();
      /* Delete the parentId so that this Item will be added as a child of the
      root proxy */
      delete item.parentId;
      // Make the ID of each of these added Items distinct among each other
      item.id = item.id + (j + 1);
      new ItemProxy('Action', item);
    }

    TreeConfiguration.getWorkingTree().loadingComplete();
  }

  getRepoStatusSubject() {
    return new BehaviorSubject<any>({ state: RepoStates.SYNCHRONIZATION_SUCCEEDED })
  }

  getRootProxy() {
    return this.mockRootProxy;
  }

  public getHistoryFor(proxy: ItemProxy): Promise<any> {
    let historyObject: any = {
      author: 'Kurios Iesous',
      commit: 'Kurios Iesous',
      message: 'Kurios Iesous.',
      date: 0
    };
    proxy.history = [historyObject];
    return Promise.resolve((JSON.parse(JSON.stringify(proxy.history))));
  }

  getProxyFor(id: string) {
    return TreeConfiguration.getWorkingTree().getProxyFor(id);
  }

  getRecentProxies() {
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

  getShortFormItemList() {

  }

  getRepositories() {

  }

  deleteItem() {

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
  async setTreeConfig() {

  }

  getTreeConfig(): Observable<any> {
    return new BehaviorSubject<any>({
      config: TreeConfiguration.getWorkingTree(),
      configType: TreeConfigType.DEFAULT
    });
  }
  
  public getSessionMap(): Promise<any> {
    return Promise.resolve({ 'socketId': {
      sessionId: 'socketId',
      address: '3.3.3.3',
      username: 'admin',
      numberOfConnections: 3
    } });
  }
}