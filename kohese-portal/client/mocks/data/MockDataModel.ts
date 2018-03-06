export let MockDataModel = {
  "name": "Item",
  "base": "PersistedModel",
  "strict": "validate",
  "idInjection": true,
  "invertItemOrder": true,
  "trackChanges": false,
  "properties": {
    "id": {
      "type": "string",
      "id": true,
      "defaultFn": "guid"
    },
    "name": {
      "type": "string",
      "required": true
    },
    "tags": {
      "type": "string",
      "required": false
    },
    "description": {
      "type": "string"
    },
    "parentId": {
      "type": "string",
      "default": ""
    },
    "createdBy": {
      "type": "string"
    },
    "createdOn": {
      "type": "number"
    },
    "modifiedBy": {
      "type": "string"
    },
    "modifiedOn": {
      "type": "number"
    }
  },
  "validations": [],
  "relations": {
    "children": {
      "type": "hasMany",
      "model": "Item",
      "foreignKey": "parentId"
    },
    "children2": {
      "type": "referencesMany",
      "model": "Item",
      "property": "childrenIds"
    },
    "parent": {
      "type": "belongsTo",
      "model": "Item",
      "foreignKey": "parentId"
    },
    "analysis": {
      "type": "hasOne",
      "model": "Analysis",
      "foreignKey": "id"
    }
  },
  "acls": [],
  "methods": []
}

