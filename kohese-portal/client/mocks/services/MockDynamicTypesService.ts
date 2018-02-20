import * as ItemProxy from '../../../common/models/item-proxy';

let MockViewPropertyData = {
  "modelName": "Item ",
  "icon": "fa fa-sticky-note",
  "viewProperties": {
    "name": {
      "inputType": "text:{\"isMultiLine\":false}",
      "required": true,
      "default": "",
      "displayName": "Name"
    },
    "description": {
      "inputType": "text:{\"isMultiLine\":false}",
      "required": false,
      "default": "",
      "displayName": "Description"
    },
    "tags": {
      "inputType" : "text:{\"isMultiLine\":false}",
      "required" : false,
      "default" : "",
      "displayName" : "Tags"
    },
    "parentId" : {
      "inputType" : "proxy-selector:{\"allowMultiSelect\":false,\"type\":\"Item\",\"useAdvancedSelector\":false}",
      "required" : true,
      "default" : "ROOT",
      "displayName" : "Parent"
    }
  },
  "id": "view-item",
  "name": "Item View Model",
  "createdBy": "jephillips",
  "createdOn": 1510596684590,
  "modifiedBy": "admin",
  "modifiedOn": 1517006598071,
  "itemIds": []
}

export class MockDynamicTypesService {
  mockType = new ItemProxy('KoheseView', MockViewPropertyData )
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