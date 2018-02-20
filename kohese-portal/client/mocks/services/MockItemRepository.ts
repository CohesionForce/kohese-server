import { BehaviorSubject} from 'rxjs/BehaviorSubject';
import { MockItem } from '../data/MockItem';
import { MockViewData } from '../data/MockViewData';
import * as ItemProxy from '../../../common/models/item-proxy';

export class MockItemRepository {
  mockRootProxy = new ItemProxy('Item', MockItem);

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
}