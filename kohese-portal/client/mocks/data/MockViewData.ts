export function MockViewData () {
  return {
  "modelName": "Item",
  "icon": "fa fa-sticky-note",
  "viewProperties": {
    "name": {
      "inputType": {
        "type": "text",
        "options": {
          "isMultiLine": false
        }
      },
      "required": true,
      "default": "",
      "displayName": "Name"
    },
    "description": {
      "inputType": {
        "type": "text",
        "options": {
          "isMultiLine": false
        }
      },
      "required": false,
      "default": "",
      "displayName": "Description"
    },
    "tags": {
      "inputType": {
        "type": "text",
        "options": {
          "isMultiLine": false
        }
      },
      "required" : false,
      "default" : "",
      "displayName" : "Tags"
    },
    "parentId" : {
      "inputType": {
        "type": "proxy-selector",
        "options": {
          "allowMultiSelect": false,
          "type": "Item",
          "useAdvancedSelector": false
        }
      },
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

export function MockItemSubclassView() {
  return {
    "id": "view-itemsubclass",
    "name": "ItemSubclass",
    "modelName": "ItemSubclass",
    "parentId": "view-item",
    "icon": "fa fa-gavel",
    "itemIds": [],
    "viewProperties": {
      "subclassProperty": {
        "inputType": {
          "type": "text",
          "options": {
            "isMultiLine": true
          }
        },
        "displayName": "Subclass Property"
      }
    }
  };
}