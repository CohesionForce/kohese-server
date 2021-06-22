/*
 * Copyright (c) 2021 CohesionForce inc. | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


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
  "localTypes": {},
  "formatDefinitions": {
    "89324a90-a7af-11e8-8662-71e48f0160fe": {
      "name": "New definition ",
      "header": {
        "kind": "header",
        "contents": [
          {
            "propertyName": {
              "kind": "Task",
              "attribute": "name"
            },
            "customLabel": "name",
            "labelOrientation": "Top",
            "kind": "text"
          }
        ]
      },
      "containers": [
        {
          "kind": "list",
          "contents": [
            {
              "propertyName": {
                "kind": "Task",
                "attribute": "description"
              },
              "customLabel": "description",
              "labelOrientation": "Top",
              "kind": "markdown"
            }
          ]
        }
      ],
      "id": "89324a90-a7af-11e8-8662-71e48f0160fe"
    },
    "1b91cfb0-1798-11ea-a725-0b882dea506f": {
      "id": "1b91cfb0-1798-11ea-a725-0b882dea506f",
      "name": "Card",
      "header": {
        "kind": "header",
        "contents": [
          {
            "propertyName": {
              "kind": "Task",
              "attribute": "name"
            },
            "customLabel": "name",
            "hideEmpty": false,
            "labelOrientation": "Top",
            "kind": "text",
            "inputOptions": {
              "type": "text",
              "options": {
                "isMultiLine": false
              }
            }
          }
        ]
      },
      "containers": [
        {
          "kind": "list",
          "contents": [
            {
              "propertyName": {
                "kind": "Task",
                "attribute": "estimatedStart"
              },
              "customLabel": "estimatedStart",
              "labelOrientation": "Top",
              "kind": "date",
              "hideEmpty": false,
              "inputOptions": {
                "type": "date",
                "options": {}
              }
            },
            {
              "propertyName": {
                "kind": "Task",
                "attribute": "estimatedCompletion"
              },
              "customLabel": "estimatedCompletion",
              "labelOrientation": "Top",
              "kind": "date",
              "hideEmpty": false,
              "inputOptions": {
                "type": "date",
                "options": {}
              }
            },
            {
              "propertyName": {
                "kind": "Task",
                "attribute": "estimatedHoursEffort"
              },
              "customLabel": "estimatedHoursEffort",
              "labelOrientation": "Top",
              "kind": "number",
              "hideEmpty": false,
              "inputOptions": {
                "type": "number",
                "options": {
                  "isMultiLine": false
                }
              }
            },
            {
              "propertyName": {
                "kind": "Task",
                "attribute": "remainingHoursEffort"
              },
              "customLabel": "remainingHoursEffort",
              "labelOrientation": "Top",
              "kind": "number",
              "hideEmpty": false,
              "inputOptions": {
                "type": "number",
                "options": {
                  "isMultiLine": false
                }
              }
            },
            {
              "propertyName": {
                "kind": "Task",
                "attribute": "actualHoursEffort"
              },
              "customLabel": "actualHoursEffort",
              "labelOrientation": "Top",
              "kind": "number",
              "hideEmpty": false,
              "inputOptions": {
                "type": "number",
                "options": {
                  "isMultiLine": false
                }
              }
            },
            {
              "propertyName": {
                "kind": "Task",
                "attribute": "predecessors"
              },
              "customLabel": "predecessors",
              "labelOrientation": "Top",
              "kind": "proxy-selector",
              "hideEmpty": false,
              "inputOptions": {
                "type": "proxy-selector",
                "options": {
                  "allowMultiSelect": true,
                  "type": "Item",
                  "useAdvancedSelector": false
                }
              },
              "tableDefinition": "3b4d68d0-e603-11e9-bf30-55b2f7a3af55"
            },
            {
              "propertyName": {
                "kind": "Task",
                "attribute": "taskState"
              },
              "customLabel": "taskState",
              "labelOrientation": "Top",
              "kind": "state-editor",
              "hideEmpty": false,
              "inputOptions": {
                "type": "state-editor",
                "options": {
                  "options": [
                    "Proposed",
                    "Accepted",
                    "In Work"
                  ]
                }
              }
            }
          ]
        }
      ]
    }
  },
  "tableDefinitions": {
    "3b4d68d0-e603-11e9-bf30-55b2f7a3af55": {
      "id": "3b4d68d0-e603-11e9-bf30-55b2f7a3af55",
      "name": "Table Definition",
      "columns": [
        "name"
      ],
      "expandedFormat": {
        "column1": [],
        "column2": [],
        "column3": [],
        "column4": []
      }
    }
  },
  "defaultFormatKey": {
    "document": "89324a90-a7af-11e8-8662-71e48f0160fe",
    "card": "1b91cfb0-1798-11ea-a725-0b882dea506f"
  },
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
    },
    "localTypes": {},
    "formatDefinitions": {},
    "tableDefinitions": {},
    "defaultFormatKey": {}
  };
}
