import { ItemProxy } from '../../../common/src/item-proxy';
import { MockViewData } from '../data/MockViewData';
import { MockKoheseType } from '../data/MockKoheseType';
import { MockItemCache } from './MockItemCache';
import { ItemCache } from '../../../common/src/item-cache';


export class MockDynamicTypesService {
  mockView = new ItemProxy('KoheseView', MockViewData() )
  constructor() {
    if (!ItemCache.getItemCache()){
      let mockItemCache = new MockItemCache();
      ItemCache.setItemCache(mockItemCache);  
    }
  }
  getKoheseTypes () {
    return {
      'Kurios Iesous': MockKoheseType(),
      'Item' : MockKoheseType()
    };
  }

  buildKoheseTypes () {

  }

  getViewProxyFor () {
    return this.mockView;
  }

  getUserInputTypes () {
    return {}
  }

  getMockKoheseType () {
    return MockKoheseType()
  }

  getIcons() {
    return ['fa fa-gavel', 'fa fa-user', 'fa fa-tasks', 'fa fa-database',
    'fa fa-exclamation-circle', 'fa fa-comment', 'fa fa-sticky-note',
    'fa fa-sitemap', 'fa fa-paper-plane', 'fa fa-trash']
  }
}
