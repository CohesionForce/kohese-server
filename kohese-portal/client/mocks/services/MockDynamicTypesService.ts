import * as ItemProxy from '../../../common/models/item-proxy';
import { MockViewData } from '../data/MockViewData';
import { MockItem } from '../data/MockItem';
import { KoheseType } from '../../src/classes/UDT/KoheseType.class';
import { MockDataModel } from '../data/MockDataModel';
import { MockKoheseType } from '../data/MockKoheseType';

export class MockDynamicTypesService {
  mockView = new ItemProxy('KoheseView', MockViewData )
  constructor() {

  }
  getKoheseTypes () {
    return {
      'Item' : MockKoheseType
    };
  }

  buildKoheseTypes () {

  }

  getViewProxyFor () {
    return this.mockView;
  }

  getUserInputTypes () {

  }
  
  getIcons() {
    return ['fa fa-gavel', 'fa fa-user', 'fa fa-tasks', 'fa fa-database',
    'fa fa-exclamation-circle', 'fa fa-comment', 'fa fa-sticky-note',
    'fa fa-sitemap', 'fa fa-paper-plane', 'fa fa-trash']
  }
}