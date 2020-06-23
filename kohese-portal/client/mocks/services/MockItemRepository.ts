
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
import { MockItemCache } from './MockItemCache';
import { ItemCache } from '../../../common/src/item-cache';
import { Type, TypeKind } from '../../../common/src/Type.interface';
import { KoheseDataModel,
  KoheseViewModel } from '../../../common/src/KoheseModel.interface';
import { FormatDefinitionType } from '../../../common/src/FormatDefinition.interface';

export class MockItemRepository {
  static modelDefinitions = ModelDefinitions();
  static singleton = new MockItemRepository();

  mockRootProxy = ItemProxy.getWorkingTree().getRootProxy();
  state: any;

  constructor() {
    console.log('### MIR Constructor called');
    if (MockItemRepository.singleton) {
      this.mockFullSync();
      return MockItemRepository.singleton;
    }
    console.log('### MIR Creating singleton');
    MockItemRepository.singleton = this;
    if (!ItemCache.getItemCache()){
      let mockItemCache = new MockItemCache();
      ItemCache.setItemCache(mockItemCache);  
    }
    this.mockFullSync();
  }

  mockFullSync () {
    TreeConfiguration.getWorkingTree().reset();

    for(let modelName in MockItemRepository.modelDefinitions.model) {
      console.log('::: Loading ' + modelName);
      let dataModel: KoheseDataModel = MockItemRepository.modelDefinitions.
        model[modelName];
      if (dataModel.name === 'KoheseModel') {
        dataModel.localTypes['Enumeration'] = {
          typeKind: TypeKind.ENUMERATION,
          id: 'Enumeration',
          name: 'Enumeration',
          values: [{
            name: 'EnumerationValue',
            description: '',
          }]
        } as Type;
    
        dataModel.properties['enumerationAttribute'] = {
          name: 'enumerationAttribute',
          type: 'Enumeration',
          relation: { contained: true }
        };
      }

      new KoheseModel(dataModel);
    }

    for(let viewName in MockItemRepository.modelDefinitions.view) {
      console.log('::: Loading ' + viewName);
      let viewModel: KoheseViewModel = MockItemRepository.modelDefinitions.view[
        viewName];
      if (viewModel.modelName === 'KoheseModel') {
        viewModel.localTypes['Enumeration'] = {
          typeKind: TypeKind.ENUMERATION,
          id: 'Enumeration',
          name: 'Enumeration',
          values: ['Enumeration Value']
        } as Type;

        viewModel.formatDefinitions[viewModel.defaultFormatKey[
          FormatDefinitionType.DEFAULT]].containers[0].contents.push({
          propertyName: 'enumerationAttribute',
          customLabel: 'Enumeration Attribute',
          labelOrientation: 'Top',
          kind: '',
          visible: true,
          editable: true
        });
      }

      new ItemProxy('KoheseView', viewModel);
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
      author: 'Mock commit author',
      commit: 'mock-commit-id',
      message: 'Mock commit message.',
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

  public upsertItem(kind: string, item: any): Promise<ItemProxy> {
    return Promise.resolve(new ItemProxy(kind, item));
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

  public getStringRepresentation(koheseObject: any, attributeName: string,
    index: number, enclosingType: KoheseDataModel, dataModel: KoheseDataModel,
    viewModel: KoheseViewModel, formatDefinitionType: FormatDefinitionType):
    string {
    return String(koheseObject[attributeName]);
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