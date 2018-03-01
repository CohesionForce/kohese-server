import { BehaviorSubject} from 'rxjs/BehaviorSubject';
import { MockItem, MockRoot } from '../data/MockItem';
import { MockViewData } from '../data/MockViewData';
import * as ItemProxy from '../../../common/models/item-proxy';
import { Subject } from 'rxjs';

export class MockItemRepository {
  mockRootProxy = ItemProxy.getRootProxy();

  constructor() {
    this.mockRootProxy.children = [
      new ItemProxy('Item', MockViewData),
      new ItemProxy('Item', MockItem),
      new ItemProxy('Item', MockItem),
      new ItemProxy('Item', MockItem),
      new ItemProxy('Item', MockItem)
    ]
    this.mockRootProxy.visitChildren = ()=>{}
  }

  getRepoStatusSubject () {
    return new BehaviorSubject<any>({connected : true})
  }

  getRootProxy () {
    return this.mockRootProxy;
  }

  getHistoryFor () {
    return (new Subject())
  }

  getProxyFor () {
    return new ItemProxy('Item', MockItem);
  }

  getRecentProxies () {
    return [
      new ItemProxy('Item', MockItem),
      new ItemProxy('Item', MockItem),
      new ItemProxy('Item', MockItem)
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