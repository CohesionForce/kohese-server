export function MockViewData () {
  return {
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
  "createdBy": "admin",
  "createdOn": 1510596684590,
  "modifiedBy": "admin",
  "modifiedOn": 1517006598071,
  "itemIds": []
  }
}