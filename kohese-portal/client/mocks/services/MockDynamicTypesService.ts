import * as ItemProxy from '../../../common/models/item-proxy';
import { MockViewData } from '../data/MockViewData';


export class MockDynamicTypesService {
  mockType = new ItemProxy('KoheseView', MockViewData )
  constructor() {
    
  }
  getKoheseTypes () {
    return {
      'types': 'Text',
      'proxy-selector': 'Reference',
      'date': 'Date'
    };
  }

  buildKoheseTypes () {

  }

  getViewProxyFor () {
    return this.mockType;
  }

  getUserInputTypes () {

  }
  
  getIcons() {
    return ['fa fa-gavel', 'fa fa-user', 'fa fa-tasks', 'fa fa-database',
    'fa fa-exclamation-circle', 'fa fa-comment', 'fa fa-sticky-note',
    'fa fa-sitemap', 'fa fa-paper-plane', 'fa fa-trash']
  }
}