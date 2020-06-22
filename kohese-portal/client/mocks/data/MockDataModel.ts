export function MockDataModel() {
  return {
    "id": "Item",
    "name": "Item",
    "parentId": "Model-Definitions",
    "base": "PersistedModel",
    "strict": "validate",
    "idInjection": true,
    "isMetaModel": true,
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
      },
      "actionState": {
        "type": "StateMachine",
        "required": true,
        "default": "Proposed",
        "properties": {
          "state": {
            "Proposed": {
              "name": "Proposed",
              "description": "An action that is Proposed."
            },
            "Assigned": {
              "name": "Assigned",
              "description": "An action that is Assigned."
            },
            "PendingReassign": {
              "name": "Pending Reassign",
              "description": "An action that is Pending Reassign."
            },
            "PendingRedisposition": {
              "name": "Pending Redisposition",
              "description": "An action that is Pending Redisposition."
            },
            "InVerification": {
              "name": "In Verification",
              "description": "An action that is In Verification."
            },
            "Verified": {
              "name": "Verified",
              "description": "An action that is Verified."
            },
            "Closed": {
              "name": "Closed",
              "description": "An action that is Closed."
            }
          },
          "transition": {
            "assign": {
              "source": "Proposed",
              "target": "Assigned",
              "guard": {},
              "requires": ["assignment:Assignee"]
            },
            "request-reassign": {
              "source": "Assigned",
              "target": "PendingReassign",
              "guard": {}
            },
            "redisposition": {
              "source": "Assigned",
              "target": "PendingRedisposition",
              "guard": {},
              "requires": ""
            },
            "defer": {
              "source": "Assigned",
              "target": "InVerification",
              "guard": {},
              "requires": []
            },
            "reassign": {
              "source": "PendingReassign",
              "target": "Assigned",
              "guard": {},
              "requires": []
            },
            "verify": {
              "source": "InVerification",
              "target": "Verified",
              "guard": {}
            },
            "close": {
              "source": "Verified",
              "target": "Closed",
              "guard": {}
            }
          }
        }
      },
      "decisionState": {
        "type": "StateMachine",
        "required": true,
        "default": "Proposed",
        "properties": {
          "state": {
            "Proposed": {
              "name": "Proposed",
              "description": "A decision that has been proposed."
            },
            "InAnalysis": {
              "name": "In Analysis",
              "description": "A decision that is In Analysis."
            },
            "InReview": {
              "name": "In Review",
              "description": "A decision that is In Review."
            },
            "Approved": {
              "name": "Approved",
              "description": "A decision that is Approved."
            },
            "Published": {
              "name": "Published",
              "description": "A decision that is Published."
            },
            "Deferred": {
              "name": "Deferred",
              "description": "A decision that is Deferred."
            },
            "Disapproved": {
              "name": "Disapproved",
              "description": "A decision that is Disapproved."
            },
            "InAppeal": {
              "name": "In Appeal",
              "description": "A decision that is In Appeal."
            }
          },
          "transition": {
            "assignAnalysis": {
              "source": "Proposed",
              "target": "InAnalysis",
              "guard": {},
              "requires": ["assignment:Analyzer"]
            },
            "reviewForApproval": {
              "source": "InAnalysis",
              "target": "InReview",
              "guard": {}
            },
            "approve": {
              "source": "InReview",
              "target": "Approved",
              "guard": {},
              "requires": ""
            },
            "defer": {
              "source": "InReview",
              "target": "Deferred",
              "guard": {},
              "requires": []
            },
            "disapprove": {
              "source": "InReview",
              "target": "Disapproved",
              "guard": {}
            },
            "publish": {
              "source": "Approved",
              "target": "Published",
              "guard": {}
            },
            "appeal": {
              "source": "Disapproved",
              "target": "InAppeal",
              "guard": {}
            }
          }
        }
      },
      "predecessors": {
        "type": [
          "Item"
        ],
        "relation": {
          "kind": "Item",
          "foreignKey": "id"
        }
      },
      "username": {
        "type": "string",
        "derived": true,
        "id": true,
        "calculated": "name"
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
    "methods": [],
    "localTypes": {}
  }
}

export function ItemSubclass() {
  return {
    "name": "ItemSubclass",
    "parentId": "Item",
    "base": "Item",
    "strict": "validate",
    "idInjection": true,
    "trackChanges": false,
    "properties": {
      "subclassProperty": {
        "type": "string"
      }
    },
    "validations": [],
    "relations": {},
    "acls": [],
    "methods": [],
    "localTypes": {}
  };
};

export function ModelDefinitions() {
  return {
    "model": {
      "Action": {
        "id": "Action",
        "name": "Action",
        "parentId": "Decision",
        "base": "Decision",
        "idInjection": true,
        "invertItemOrder": true,
        "properties": {
          "actionState": {
            "type": "StateMachine",
            "required": true,
            "default": "Proposed",
            "properties": {
              "state": {
                "Proposed": {
                  "name": "Proposed",
                  "description": "An action that is Proposed."
                },
                "Assigned": {
                  "name": "Assigned",
                  "description": "An action that is Assigned."
                },
                "Accepted": {
                  "name": "Accepted",
                  "description": ""
                },
                "PendingReassign": {
                  "name": "Pending Reassign",
                  "description": "An action that is Pending Reassign."
                },
                "PendingRedisposition": {
                  "name": "Pending Redisposition",
                  "description": "An action that is Pending Redisposition."
                },
                "InWork": {
                  "name": "In Work",
                  "description": "An action that is In Work."
                },
                "InVerification": {
                  "name": "In Verification",
                  "description": "An action that is In Verification."
                },
                "Verified": {
                  "name": "Verified",
                  "description": "An action that is Verified."
                },
                "Closed": {
                  "name": "Closed",
                  "description": "An action that is Closed."
                }
              },
              "transition": {
                "Assign": {
                  "source": "Proposed",
                  "target": "Assigned",
                  "guard": {},
                  "requires": [
                    "assignment:Assignee"
                  ]
                },
                "Request Reassign": {
                  "source": "Assigned",
                  "target": "PendingReassign",
                  "guard": {}
                },
                "Request Redisposition After Assigned": {
                  "source": "Assigned",
                  "target": "PendingRedisposition",
                  "guard": {},
                  "requires": ""
                },
                "Accept": {
                  "source": "Assigned",
                  "target": "Accepted",
                  "guard": {}
                },
                "Request Reassign After Accepted": {
                  "source": "Accepted",
                  "target": "PendingReassign",
                  "guard": {}
                },
                "Request Redisposition After Accepted": {
                  "source": "Accepted",
                  "target": "PendingRedisposition",
                  "guard": {}
                },
                "Redisposition": {
                  "source": "PendingRedisposition",
                  "target": "Proposed",
                  "guard": {}
                },
                "Begin Work": {
                  "source": "Accepted",
                  "target": "InWork",
                  "guard": {}
                },
                "Request Verification": {
                  "source": "InWork",
                  "target": "InVerification",
                  "guard": {},
                  "requires": []
                },
                "Reassign": {
                  "source": "PendingReassign",
                  "target": "Assigned",
                  "guard": {},
                  "requires": []
                },
                "Verify": {
                  "source": "InVerification",
                  "target": "Verified",
                  "guard": {}
                },
                "Close": {
                  "source": "Verified",
                  "target": "Closed",
                  "guard": {}
                },
                "Revert To In Work": {
                  "source": "InVerification",
                  "target": "InWork",
                  "guard": {}
                }
              }
            },
            "name": "actionState"
          },
          "predecessors": {
            "type": [
              "Item"
            ],
            "relation": {
              "kind": "Item",
              "foreignKey": "id"
            },
            "name": "predecessors"
          },
          "assignedTo": {
            "type": "string",
            "relation": {
              "kind": "KoheseUser",
              "foreignKey": "username"
            },
            "name": "assignedTo"
          },
          "associatedWorkflow": {
            "type": "string",
            "name": "associatedWorkflow"
          },
          "estimatedStart": {
            "type": "timestamp",
            "name": "estimatedStart"
          },
          "estimatedCompletion": {
            "type": "timestamp",
            "name": "estimatedCompletion"
          },
          "estimatedHoursEffort": {
            "type": "number",
            "name": "estimatedHoursEffort"
          },
          "actualStart": {
            "type": "timestamp",
            "name": "actualStart"
          },
          "actualCompletion": {
            "type": "timestamp",
            "name": "actualCompletion"
          },
          "remainingHoursEffort": {
            "type": "number",
            "name": "remainingHoursEffort"
          },
          "actualHoursEffort": {
            "type": "number",
            "name": "actualHoursEffort"
          }
        },
        "validations": [],
        "relations": {},
        "acls": [],
        "methods": [],
        "localTypes": {}
      },
      "Actor": {
        "id": "Actor",
        "name": "Actor",
        "parentId": "Decision",
        "createdBy": "gmckune",
        "createdOn": 1586302647375,
        "modifiedBy": "gmckune",
        "modifiedOn": 1586372358125,
        "base": "Decision",
        "idInjection": true,
        "properties": {},
        "validations": [],
        "relations": {},
        "acls": [],
        "methods": [],
        "localTypes": {}
      },
      "Analysis": {
        "id": "Analysis",
        "name": "Analysis",
        "parentId": "Model-Definitions",
        "base": "PersistedModel",
        "idInjection": true,
        "invertItemOrder": true,
        "properties": {
          "id": {
            "type": "string",
            "required": true
          },
          "raw": {
            "type": "object"
          }
        },
        "validations": [],
        "relations": {},
        "acls": [],
        "methods": [],
        "localTypes": {}
      },
      "Category": {
        "id": "Category",
        "name": "Category",
        "parentId": "Item",
        "base": "Item",
        "idInjection": true,
        "invertItemOrder": true,
        "properties": {},
        "validations": [],
        "relations": {},
        "acls": [],
        "methods": [],
        "localTypes": {}
      },
      "Decision": {
        "id": "Decision",
        "name": "Decision",
        "parentId": "Item",
        "base": "Item",
        "idInjection": true,
        "invertItemOrder": true,
        "properties": {
          "decisionState": {
            "type": "StateMachine",
            "required": true,
            "default": "Proposed",
            "properties": {
              "state": {
                "Proposed": {
                  "name": "Proposed",
                  "description": "A decision that has been proposed."
                },
                "InAnalysis": {
                  "name": "In Analysis",
                  "description": "A decision that is In Analysis."
                },
                "InReview": {
                  "name": "In Review",
                  "description": "A decision that is In Review."
                },
                "Approved": {
                  "name": "Approved",
                  "description": "A decision that is Approved."
                },
                "Published": {
                  "name": "Published",
                  "description": "A decision that is Published."
                },
                "Deferred": {
                  "name": "Deferred",
                  "description": "A decision that is Deferred."
                },
                "Disapproved": {
                  "name": "Disapproved",
                  "description": "A decision that is Disapproved."
                },
                "InAppeal": {
                  "name": "In Appeal",
                  "description": "A decision that is In Appeal."
                }
              },
              "transition": {
                "Assign Analysis": {
                  "source": "Proposed",
                  "target": "InAnalysis",
                  "guard": {},
                  "requires": [
                    "assignment:Analyzer"
                  ]
                },
                "Review For Approval": {
                  "source": "InAnalysis",
                  "target": "InReview",
                  "guard": {}
                },
                "Approve": {
                  "source": "InReview",
                  "target": "Approved",
                  "guard": {},
                  "requires": ""
                },
                "Defer": {
                  "source": "InReview",
                  "target": "Deferred",
                  "guard": {},
                  "requires": []
                },
                "Disapprove": {
                  "source": "InReview",
                  "target": "Disapproved",
                  "guard": {}
                },
                "Publish": {
                  "source": "Approved",
                  "target": "Published",
                  "guard": {}
                },
                "Appeal": {
                  "source": "Disapproved",
                  "target": "InAppeal",
                  "guard": {}
                }
              }
            }
          },
          "approvedBy": {
            "type": "string"
          },
          "approvedOn": {
            "type": "timestamp"
          },
          "rationale": {
            "type": "string"
          },
          "alternatives": {
            "type": [
              "object"
            ]
          },
          "costImpact": {
            "type": "object"
          },
          "scheduleImpact": {
            "type": "object"
          },
          "otherImpacts": {
            "type": [
              "object"
            ]
          }
        },
        "validations": [],
        "relations": {},
        "acls": [],
        "methods": [],
        "localTypes": {}
      },
      "DocumentConfiguration": {
        "id": "DocumentConfiguration",
        "name": "DocumentConfiguration",
        "parentId": "Item",
        "base": "Item",
        "idInjection": true,
        "invertItemOrder": true,
        "properties": {
          "components": {
            "type": "object",
            "required": true,
            "default": {}
          },
          "delineated": {
            "type": "boolean",
            "required": true,
            "default": false
          }
        },
        "validations": [],
        "relations": {},
        "acls": [],
        "methods": [],
        "localTypes": {}
      },
      "Domain": {
        "id": "Domain",
        "name": "Domain",
        "parentId": "Decision",
        "createdBy": "gmckune",
        "createdOn": 1586302904721,
        "modifiedBy": "gmckune",
        "modifiedOn": 1586375436637,
        "base": "Decision",
        "idInjection": true,
        "properties": {},
        "validations": [],
        "relations": {},
        "acls": [],
        "methods": [],
        "localTypes": {}
      },
      "Internal-Lost": {
        "id": "Internal-Lost",
        "name": "Internal-Lost",
        "parentId": "Item",
        "base": "Item",
        "idInjection": false,
        "isMetaModel": true,
        "isInternal": true,
        "invertItemOrder": false,
        "properties": {},
        "validations": [],
        "relations": {},
        "acls": [],
        "methods": [],
        "localTypes": {}
      },
      "Internal": {
        "id": "Internal",
        "name": "Internal",
        "parentId": "Item",
        "base": "Item",
        "idInjection": false,
        "isMetaModel": true,
        "isInternal": true,
        "invertItemOrder": false,
        "properties": {},
        "validations": [],
        "relations": {},
        "acls": [],
        "methods": [],
        "localTypes": {}
      },
      "Issue": {
        "id": "Issue",
        "name": "Issue",
        "parentId": "Observation",
        "base": "Observation",
        "idInjection": true,
        "invertItemOrder": true,
        "properties": {
          "issueState": {
            "type": "StateMachine",
            "default": "Observed",
            "required": true,
            "properties": {
              "state": {
                "Observed": {
                  "name": "Observed",
                  "description": "The issue has been Observed."
                },
                "InAnalysis": {
                  "name": "In Analysis",
                  "description": "The issue is In Analysis."
                },
                "NoAction": {
                  "name": "No Action",
                  "description": "The issue requires No Action."
                },
                "Duplicate": {
                  "name": "Duplicate",
                  "description": "The issue is a Duplicate."
                },
                "RequiresAction": {
                  "name": "Requires Action",
                  "description": "The issue Requires Action."
                },
                "Resolved": {
                  "name": "Resolved",
                  "description": "The issue is Resolved."
                }
              },
              "transition": {
                "Assign Analysis": {
                  "source": "Observed",
                  "target": "InAnalysis",
                  "guard": {},
                  "requires": [
                    "analysisAction"
                  ]
                },
                "No Action Required": {
                  "source": "InAnalysis",
                  "target": "NoAction",
                  "guard": {}
                },
                "Mark As Duplicate": {
                  "source": "InAnalysis",
                  "target": "Duplicate",
                  "guard": {},
                  "requires": "relatedIssues"
                },
                "Requires Action": {
                  "source": "InAnalysis",
                  "target": "RequiresAction",
                  "guard": {},
                  "requires": "resolutionActions"
                },
                "Resolve": {
                  "source": "RequiresAction",
                  "target": "Resolved",
                  "guard": {
                    "tbd": "Insert guard to ensure all associated actions are closed"
                  }
                }
              }
            },
            "name": "issueState"
          },
          "relatedIssues": {
            "name": "relatedIssues",
            "type": [
              "Issue"
            ],
            "required": false,
            "id": false,
            "relation": {
              "kind": "Item",
              "foreignKey": "id"
            }
          },
          "analysisAction": {
            "type": "Item",
            "relation": {
              "kind": "Item",
              "foreignKey": "id"
            },
            "name": "analysisAction"
          },
          "resolutionActions": {
            "type": [
              "Action"
            ],
            "relation": {
              "kind": "Item",
              "foreignKey": "id"
            },
            "name": "resolutionActions"
          },
          "response": {
            "type": "string",
            "name": "response"
          }
        },
        "validations": [],
        "relations": {
          "relatedIssues": {
            "type": [
              "Issue"
            ]
          }
        },
        "acls": [],
        "methods": [],
        "localTypes": {}
      },
      "Item": {
        "id": "Item",
        "name": "Item",
        "parentId": "Model-Definitions",
        "base": "PersistedModel",
        "isMetaModel": true,
        "idInjection": true,
        "invertItemOrder": true,
        "properties": {
          "kind": {
            "type": "string",
            "derived": true,
            "name": "kind"
          },
          "status": {
            "type": [
              "string"
            ],
            "derived": true,
            "name": "status"
          },
          "id": {
            "type": "string",
            "id": true,
            "defaultFn": "uuidV1",
            "name": "id"
          },
          "name": {
            "type": "string",
            "required": true,
            "name": "name"
          },
          "tags": {
            "type": "string",
            "required": false,
            "name": "tags"
          },
          "description": {
            "type": "string",
            "name": "description"
          },
          "parentId": {
            "type": "string",
            "name": "parentId"
          },
          "createdBy": {
            "type": "string",
            "name": "createdBy"
          },
          "createdOn": {
            "type": "timestamp",
            "name": "createdOn"
          },
          "modifiedBy": {
            "type": "string",
            "name": "modifiedBy"
          },
          "modifiedOn": {
            "type": "timestamp",
            "name": "modifiedOn"
          },
          "loadPending": {
            "type": "boolean",
            "derived": true,
            "name": "loadPending"
          },
          "hasValidationError": {
            "type": "boolean",
            "derived": true,
            "name": "hasValidationError"
          },
          "$dirtyFields": {
            "type": "object",
            "derived": true,
            "name": "$dirtyFields"
          },
          "__deletedProperty": {
            "type": "object",
            "derived": true,
            "name": "__deletedProperty"
          },
          "itemIds": {
            "type": [
              "string"
            ],
            "name": "itemIds"
          },
          "children": {
            "name": "children",
            "derived": true,
            "type": [
              "Item"
            ],
            "required": false,
            "id": false,
            "relation": {
              "kind": "Item",
              "foreignKey": "id"
            }
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
        "methods": [],
        "localTypes": {}
      },
      "KeyEvent": {
        "id": "KeyEvent",
        "name": "KeyEvent",
        "description": "This Kind allows for the definition of the attributes associated with a Key Event.",
        "parentId": "Decision",
        "createdBy": "gmckune",
        "createdOn": 1566607211922,
        "modifiedBy": "gmckune",
        "modifiedOn": 1586900797128,
        "base": "Decision",
        "idInjection": true,
        "properties": {
          "DetectionMechanism": {
            "type": "string",
            "required": false,
            "name": "DetectionMechanism"
          },
          "EventInputData": {
            "type": "string",
            "required": false,
            "name": "EventInputData"
          },
          "Responses": {
            "type": "string",
            "required": false,
            "name": "Responses"
          },
          "EventOutputData": {
            "type": "string",
            "required": false,
            "name": "EventOutputData"
          }
        },
        "validations": [],
        "relations": {},
        "acls": [],
        "methods": [],
        "localTypes": {}
      },
      "KeyEventDictionary": {
        "id": "KeyEventDictionary",
        "name": "KeyEventDictionary",
        "parentId": "Decision",
        "createdBy": "gmckune",
        "createdOn": 1572491164821,
        "modifiedBy": "gmckune",
        "modifiedOn": 1572491746960,
        "base": "Decision",
        "idInjection": true,
        "properties": {
          "KeyEvents": {
            "type": [
              "KeyEvent"
            ],
            "required": false,
            "relation": {
              "kind": "Item",
              "foreignKey": "id"
            }
          }
        },
        "validations": [],
        "relations": {},
        "acls": [],
        "methods": [],
        "localTypes": {}
      },
      "KoheseModel": {
        "id": "KoheseModel",
        "name": "KoheseModel",
        "parentId": "Item",
        "base": "Item",
        "isMetaModel": true,
        "idInjection": false,
        "invertItemOrder": false,
        "properties": {
          "base": {
            "type": "string",
            "required": true,
            "name": "base"
          },
          "isMetaModel": {
            "type": "boolean",
            "name": "isMetaModel"
          },
          "isInternal": {
            "type": "boolean",
            "name": "isInternal"
          },
          "idInjection": {
            "type": "boolean",
            "required": true,
            "name": "idInjection"
          },
          "invertItemOrder": {
            "type": "boolean",
            "required": false,
            "name": "invertItemOrder"
          },
          "properties": {
            "type": "object",
            "required": true,
            "name": "properties"
          },
          "validations": {
            "type": [
              "object"
            ],
            "required": true,
            "name": "validations"
          },
          "relations": {
            "type": "object",
            "required": true,
            "name": "relations"
          },
          "acls": {
            "type": [
              "object"
            ],
            "required": true,
            "name": "acls"
          },
          "methods": {
            "type": [
              "object"
            ],
            "required": true,
            "name": "methods"
          },
          "classLocalTypes": {
            "type": "object",
            "derived": true,
            "name": "classLocalTypes"
          },
          "classParentTypes": {
            "type": [
              "string"
            ],
            "derived": true,
            "name": "classParentTypes"
          },
          "classProperties": {
            "type": "object",
            "derived": true,
            "name": "classProperties"
          },
          "propertyOrder": {
            "type": [
              "string"
            ],
            "derived": true,
            "name": "propertyOrder"
          },
          "propertyStorageOrder": {
            "type": [
              "string"
            ],
            "derived": true,
            "name": "propertyStorageOrder"
          },
          "requiredProperties": {
            "type": [
              "string"
            ],
            "derived": true,
            "name": "requiredProperties"
          },
          "derivedProperties": {
            "type": [
              "string"
            ],
            "derived": true,
            "name": "derivedProperties"
          },
          "calculatedProperties": {
            "type": [
              "string"
            ],
            "derived": true,
            "name": "calculatedProperties"
          },
          "stateProperties": {
            "type": [
              "string"
            ],
            "derived": true,
            "name": "stateProperties"
          },
          "relationProperties": {
            "type": [
              "string"
            ],
            "derived": true,
            "name": "relationProperties"
          },
          "idProperties": {
            "type": [
              "string"
            ],
            "derived": true,
            "name": "idProperties"
          },
          "localTypes": {
            "type": "object",
            "required": true,
            "name": "localTypes"
          }
        },
        "validations": [],
        "relations": {},
        "acls": [],
        "methods": [],
        "localTypes": {
          "PropertyType": {
            "name": "PropertyType",
            "base": null,
            "idInjection": true,
            "properties": {
              "type": {
                "name": "type",
                "type": "string",
                "required": true
              },
              "required": {
                "name": "required",
                "type": "boolean"
              },
              "id": {
                "name": "id",
                "type": "boolean"
              },
              "derived": {
                "name": "derived",
                "type": "boolean"
              },
              "calculated": {
                "name": "calculated",
                "type": "string"
              },
              "hidden": {
                "name": "hidden",
                "type": "boolean"
              },
              "relation": {
                "name": "relation",
                "type": "RelationType",
                "relation": {
                  "contained": true,
                  "type": "Item",
                  "foreignKey": "id"
                }
              }
            },
            "validations": [],
            "relations": {},
            "acls": [],
            "methods": []
          },
          "RelationType": {
            "name": "RelationType",
            "base": null,
            "idInjection": true,
            "properties": {
              "kind": {
                "name": "kind",
                "type": "string",
                "required": false,
                "id": false,
                "default": ""
              },
              "foreignKey": {
                "name": "foreignKey",
                "type": "string",
                "required": false,
                "id": false,
                "default": ""
              },
              "contained": {
                "name": "contained",
                "type": "boolean",
                "required": false,
                "id": false
              }
            },
            "validations": [],
            "relations": {},
            "acls": [],
            "methods": []
          }
        }
      },
      "KoheseUser": {
        "id": "KoheseUser",
        "name": "KoheseUser",
        "parentId": "Item",
        "base": "Item",
        "idInjection": true,
        "isMetaModel": true,
        "invertItemOrder": true,
        "properties": {
          "password": {
            "type": "string",
            "required": true,
            "hidden": true
          },
          "email": {
            "type": "string",
            "required": false
          },
          "username": {
            "type": "string",
            "derived": true,
            "id": true,
            "calculated": "name"
          }
        },
        "validations": [],
        "relations": {},
        "acls": [],
        "methods": [],
        "localTypes": {}
      },
      "KoheseView": {
        "id": "KoheseView",
        "name": "KoheseView",
        "parentId": "Item",
        "base": "Item",
        "idInjection": true,
        "invertItemOrder": false,
        "properties": {
          "modelName": {
            "type": "string",
            "required": true,
            "name": "modelName"
          },
          "icon": {
            "type": "string",
            "name": "icon"
          },
          "color": {
            "type": "string",
            "required": true,
            "default": "#000000",
            "name": "color"
          },
          "viewProperties": {
            "type": "object",
            "required": true,
            "name": "viewProperties"
          },
          "localTypes": {
            "type": "object",
            "required": true,
            "name": "localTypes"
          },
          "formatDefinitions": {
            "type": "object",
            "required": true,
            "name": "formatDefinitions"
          },
          "defaultFormatKey": {
            "type": "object",
            "required": true,
            "name": "defaultFormatKey"
          },
          "tableDefinitions": {
            "type": "object",
            "required": true,
            "name": "tableDefinitions"
          },
          "ungroupDefaultFormatDefinitionStateAttributes": {
            "name": "ungroupDefaultFormatDefinitionStateAttributes",
            "type": "boolean",
            "defaultValue": false
          }
        },
        "validations": [],
        "relations": {},
        "acls": [],
        "methods": [],
        "localTypes": {}
      },
      "Observation": {
        "id": "Observation",
        "name": "Observation",
        "parentId": "Item",
        "base": "Item",
        "idInjection": true,
        "invertItemOrder": true,
        "properties": {
          "observedBy": {
            "type": "string",
            "relation": {
              "kind": "KoheseUser",
              "foreignKey": "username"
            },
            "required": true
          },
          "observedOn": {
            "type": "timestamp",
            "required": true
          },
          "context": {
            "type": [
              "Item"
            ],
            "relation": {
              "kind": "Item",
              "foreignKey": "id"
            },
            "required": true
          }
        },
        "validations": [],
        "relations": {},
        "acls": [],
        "methods": [],
        "localTypes": {}
      },
      "Project": {
        "id": "Project",
        "name": "Project",
        "parentId": "Item",
        "base": "Item",
        "idInjection": true,
        "invertItemOrder": false,
        "properties": {
          "projectItems": {
            "type": [
              "Item"
            ],
            "relation": true
          }
        },
        "validations": [],
        "relations": {},
        "acls": [],
        "methods": [],
        "localTypes": {}
      },
      "ReportDefinition": {
        "id": "ReportDefinition",
        "name": "ReportDefinition",
        "parentId": "Item",
        "base": "Item",
        "idInjection": false,
        "invertItemOrder": false,
        "properties": {
          "entryPoints": {
            "type": [
              "Item"
            ],
            "relation": true
          },
          "typeFormats": {
            "type": [
              "object"
            ]
          }
        },
        "validations": [],
        "relations": {},
        "acls": [],
        "methods": [],
        "localTypes": {}
      },
      "Repository": {
        "id": "Repository",
        "name": "Repository",
        "parentId": "Item",
        "base": "Item",
        "idInjection": true,
        "invertItemOrder": true,
        "properties": {
          "origin": {
            "type": "string",
            "required": false
          },
          "mounted": {
            "type": "boolean",
            "derived": true
          }
        },
        "validations": [],
        "relations": {},
        "acls": [],
        "methods": [],
        "localTypes": {}
      },
      "Task": {
        "id": "Task",
        "name": "Task",
        "parentId": "Item",
        "base": "Item",
        "idInjection": true,
        "invertItemOrder": true,
        "properties": {
          "taskState": {
            "type": "StateMachine",
            "required": true,
            "default": "Proposed",
            "properties": {
              "state": {
                "Proposed": {
                  "name": "Proposed",
                  "description": "A task that is Proposed."
                },
                "Assigned": {
                  "name": "Assigned",
                  "description": "A task that is Assigned."
                },
                "Accepted": {
                  "name": "Accepted",
                  "description": ""
                },
                "InWork": {
                  "name": "In Work",
                  "description": "A task that is In Work."
                },
                "PendingReassign": {
                  "name": "Pending Reassign",
                  "description": "A task that is Pending Reassign."
                },
                "InVerification": {
                  "name": "In Verification",
                  "description": "A task that is In Verification."
                },
                "Verified": {
                  "name": "Verified",
                  "description": "A task that is Verified."
                },
                "Completed": {
                  "name": "Completed",
                  "description": "A task that is Completed."
                }
              },
              "transition": {
                "Assign": {
                  "source": "Proposed",
                  "target": "Assigned",
                  "guard": {},
                  "requires": [
                    "assignment:Assignee"
                  ]
                },
                "Accept": {
                  "source": "Assigned",
                  "target": "Accepted",
                  "guard": {}
                },
                "Request Reassign After Accepted": {
                  "source": "Accepted",
                  "target": "PendingReassign",
                  "guard": {}
                },
                "Begin Work": {
                  "source": "Accepted",
                  "target": "InWork",
                  "guard": {},
                  "requires": ""
                },
                "Request Reassign": {
                  "source": "Assigned",
                  "target": "PendingReassign",
                  "guard": {}
                },
                "Reassign": {
                  "source": "PendingReassign",
                  "target": "Assigned",
                  "guard": {},
                  "requires": []
                },
                "Revert To Proposed": {
                  "source": "InWork",
                  "target": "Proposed",
                  "guard": {}
                },
                "Remove Assignment": {
                  "source": "PendingReassign",
                  "target": "Proposed",
                  "guard": {}
                },
                "Request Verification": {
                  "source": "InWork",
                  "target": "InVerification",
                  "guard": {}
                },
                "Revert To In Work": {
                  "source": "InVerification",
                  "target": "InWork",
                  "guard": {}
                },
                "Verify": {
                  "source": "InVerification",
                  "target": "Verified",
                  "guard": {}
                },
                "Complete": {
                  "source": "Verified",
                  "target": "Completed",
                  "guard": {}
                }
              }
            },
            "name": "taskState"
          },
          "predecessors": {
            "type": [
              "Item"
            ],
            "relation": {
              "kind": "Item",
              "foreignKey": "id"
            },
            "name": "predecessors"
          },
          "assignedTo": {
            "type": "string",
            "relation": {
              "kind": "KoheseUser",
              "foreignKey": "username"
            },
            "name": "assignedTo"
          },
          "estimatedStart": {
            "type": "timestamp",
            "name": "estimatedStart"
          },
          "estimatedCompletion": {
            "type": "timestamp",
            "name": "estimatedCompletion"
          },
          "estimatedHoursEffort": {
            "type": "number",
            "name": "estimatedHoursEffort"
          },
          "actualStart": {
            "type": "timestamp",
            "name": "actualStart"
          },
          "actualCompletion": {
            "type": "timestamp",
            "name": "actualCompletion"
          },
          "remainingHoursEffort": {
            "type": "number",
            "name": "remainingHoursEffort"
          },
          "actualHoursEffort": {
            "type": "number",
            "name": "actualHoursEffort"
          }
        },
        "validations": [],
        "relations": {},
        "acls": [],
        "methods": [],
        "localTypes": {}
      },
      "UseCase": {
        "id": "UseCase",
        "name": "UseCase",
        "description": "This type contains the attributes needed to define a Use Case.",
        "parentId": "Decision",
        "createdBy": "gmckune",
        "createdOn": 1570033169840,
        "modifiedBy": "gmckune",
        "modifiedOn": 1587074473129,
        "base": "Decision",
        "idInjection": true,
        "properties": {
          "Actors": {
            "name": "Actors",
            "type": [
              "Actor"
            ],
            "required": false,
            "relation": {
              "kind": "Item",
              "foreignKey": "id"
            }
          },
          "BasicPath": {
            "name": "BasicPath",
            "type": "FlowOfEvents",
            "required": false,
            "relation": {
              "contained": true
            }
          },
          "AlternativePaths": {
            "name": "AlternativePaths",
            "type": [
              "FlowOfEvents"
            ],
            "required": false,
            "relation": {
              "contained": true
            }
          }
        },
        "validations": [],
        "relations": {},
        "acls": [],
        "methods": [],
        "localTypes": {
          "FlowOfEvents": {
            "name": "FlowOfEvents",
            "base": "Item",
            "idInjection": true,
            "properties": {
              "PathName": {
                "name": "PathName",
                "type": "string",
                "required": false,
                "id": false
              },
              "PathDescription": {
                "name": "PathDescription",
                "type": "string",
                "required": false,
                "id": false
              },
              "Preconditions": {
                "name": "Preconditions",
                "type": [
                  "string"
                ],
                "required": false,
                "id": false
              },
              "Postconditions": {
                "name": "Postconditions",
                "type": [
                  "string"
                ],
                "required": false,
                "id": false
              },
              "Flow": {
                "name": "Flow",
                "type": [
                  "KeyEvent"
                ],
                "required": false,
                "id": false,
                "relation": {
                  "kind": "Item",
                  "foreignKey": "id"
                }
              }
            },
            "validations": [],
            "relations": {},
            "acls": [],
            "methods": []
          }
        }
      }
    },
    "view": {
      "Action View Model": {
        "id": "view-action",
        "name": "Action View Model",
        "parentId": "view-decision",
        "modelName": "Action",
        "icon": "fa fa-paper-plane",
        "color": "#00008b",
        "viewProperties": {
          "actionState": {
            "inputType": {
              "type": "state-editor",
              "options": {
                "options": [
                  "Proposed",
                  "Assigned",
                  "Accepted",
                  "In Work",
                  "Pending Reassign",
                  "Pending Redisposition",
                  "In Verification",
                  "Verified",
                  "Closed"
                ]
              }
            },
            "required": false,
            "default": "Proposed",
            "displayName": "actionState",
            "name": "actionState"
          },
          "assignedTo": {
            "inputType": {
              "type": "user-selector",
              "options": {}
            },
            "required": false,
            "default": null,
            "displayName": "assignedTo",
            "name": "assignedTo"
          },
          "estimatedStart": {
            "inputType": {
              "type": "date",
              "options": {}
            },
            "required": false,
            "default": null,
            "displayName": "estimatedStart",
            "name": "estimatedStart"
          },
          "estimatedCompletion": {
            "inputType": {
              "type": "date",
              "options": {}
            },
            "required": false,
            "default": null,
            "displayName": "estimatedCompletion",
            "name": "estimatedCompletion"
          },
          "estimatedHoursEffort": {
            "inputType": {
              "type": "number",
              "options": {
                "isMultiLine": false
              }
            },
            "required": false,
            "default": "",
            "displayName": "estimatedHoursEffort",
            "name": "estimatedHoursEffort"
          },
          "actualStart": {
            "inputType": {
              "type": "date",
              "options": {}
            },
            "required": false,
            "default": null,
            "displayName": "actualStart",
            "name": "actualStart"
          },
          "actualCompletion": {
            "inputType": {
              "type": "date",
              "options": {}
            },
            "required": false,
            "default": null,
            "displayName": "actualCompletion",
            "name": "actualCompletion"
          },
          "remainingHoursEffort": {
            "inputType": {
              "type": "number",
              "options": {
                "isMultiLine": false
              }
            },
            "required": false,
            "default": "",
            "displayName": "remainingHoursEffort",
            "name": "remainingHoursEffort"
          },
          "actualHoursEffort": {
            "inputType": {
              "type": "number",
              "options": {
                "isMultiLine": false
              }
            },
            "required": false,
            "default": "",
            "displayName": "actualHoursEffort",
            "name": "actualHoursEffort"
          },
          "predecessors": {
            "inputType": {
              "type": "proxy-selector",
              "options": {
                "allowMultiSelect": true,
                "type": "Item",
                "useAdvancedSelector": false
              }
            },
            "required": false,
            "default": null,
            "displayName": "predecessors",
            "name": "predecessors"
          }
        },
        "localTypes": {},
        "formatDefinitions": {
          "f5aec260-5d71-11ea-8553-c51caee8a5fd": {
            "id": "f5aec260-5d71-11ea-8553-c51caee8a5fd",
            "name": "Default Format Definition",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "kind": "text",
                  "visible": true,
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "kind",
                    "customLabel": "Kind",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "status",
                    "customLabel": "Status",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "id",
                    "customLabel": "ID",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "tags",
                    "customLabel": "Tags",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "parentId",
                    "customLabel": "Parent",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "createdBy",
                    "customLabel": "Created By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "createdOn",
                    "customLabel": "Created On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedBy",
                    "customLabel": "Modified By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedOn",
                    "customLabel": "Modified On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "loadPending",
                    "customLabel": "loadPending",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "hasValidationError",
                    "customLabel": "hasValidationError",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "$dirtyFields",
                    "customLabel": "$dirtyFields",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "__deletedProperty",
                    "customLabel": "__deletedProperty",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "itemIds",
                    "customLabel": "itemIds",
                    "labelOrientation": "Top",
                    "kind": "string",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "children",
                    "customLabel": "Children",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "approvedBy",
                    "customLabel": "approvedBy",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "text",
                    "editable": true
                  },
                  {
                    "propertyName": "approvedOn",
                    "customLabel": "approvedOn",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "date",
                    "editable": true
                  },
                  {
                    "propertyName": "rationale",
                    "customLabel": "rationale",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "text",
                    "editable": true
                  },
                  {
                    "propertyName": "alternatives",
                    "customLabel": "alternatives",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "costImpact",
                    "customLabel": "costImpact",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "scheduleImpact",
                    "customLabel": "scheduleImpact",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "otherImpacts",
                    "customLabel": "otherImpacts",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "predecessors",
                    "customLabel": "predecessors",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "assignedTo",
                    "customLabel": "assignedTo",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "text",
                    "editable": true
                  },
                  {
                    "propertyName": "associatedWorkflow",
                    "customLabel": "associatedWorkflow",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "text",
                    "editable": true
                  },
                  {
                    "propertyName": "estimatedStart",
                    "customLabel": "estimatedStart",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "date",
                    "editable": true
                  },
                  {
                    "propertyName": "estimatedCompletion",
                    "customLabel": "estimatedCompletion",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "date",
                    "editable": true
                  },
                  {
                    "propertyName": "estimatedHoursEffort",
                    "customLabel": "estimatedHoursEffort",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "number",
                    "editable": true
                  },
                  {
                    "propertyName": "actualStart",
                    "customLabel": "actualStart",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "date",
                    "editable": true
                  },
                  {
                    "propertyName": "actualCompletion",
                    "customLabel": "actualCompletion",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "date",
                    "editable": true
                  },
                  {
                    "propertyName": "remainingHoursEffort",
                    "customLabel": "remainingHoursEffort",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "number",
                    "editable": true
                  },
                  {
                    "propertyName": "actualHoursEffort",
                    "customLabel": "actualHoursEffort",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "number",
                    "editable": true
                  }
                ]
              },
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "decisionState",
                    "customLabel": "decisionState",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "state-editor",
                    "editable": true
                  },
                  {
                    "propertyName": "actionState",
                    "customLabel": "actionState",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "state-editor",
                    "editable": true
                  }
                ]
              }
            ]
          },
          "89324a90-a7af-11e8-8662-71e48f0160fe": {
            "name": "New definition ",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "kind": "text",
                  "visible": true,
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "assignedTo",
                    "customLabel": "Assigned To",
                    "labelOrientation": "Left",
                    "kind": "text",
                    "tableDefinition": "",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "decisionState",
                    "customLabel": "Decision State",
                    "labelOrientation": "Left",
                    "kind": "state-editor",
                    "tableDefinition": "",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "actionState",
                    "customLabel": "Action State",
                    "labelOrientation": "Left",
                    "kind": "state-editor",
                    "tableDefinition": "",
                    "visible": true,
                    "editable": true
                  }
                ]
              }
            ],
            "id": "89324a90-a7af-11e8-8662-71e48f0160fe"
          },
          "420b0560-1781-11ea-a38d-57607570dcb1": {
            "id": "420b0560-1781-11ea-a38d-57607570dcb1",
            "name": "Card",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "visible": true,
                  "labelOrientation": "Top",
                  "kind": "text",
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "estimatedStart",
                    "customLabel": "Estimated Start",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "estimatedCompletion",
                    "customLabel": "Estimated Completion",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "estimatedHoursEffort",
                    "customLabel": "Estimated Hours Effort",
                    "labelOrientation": "Top",
                    "kind": "number",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "remainingHoursEffort",
                    "customLabel": "Remaining Hours Effort",
                    "labelOrientation": "Top",
                    "kind": "number",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "actualHoursEffort",
                    "customLabel": "Actual Hours Effort",
                    "labelOrientation": "Top",
                    "kind": "number",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "predecessors",
                    "customLabel": "Predecessors",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": true,
                    "tableDefinition": "3b4d68d0-e603-11e9-bf30-55b2f7a3af55"
                  },
                  {
                    "propertyName": "assignedTo",
                    "customLabel": "Assigned To",
                    "labelOrientation": "Left",
                    "kind": "text",
                    "tableDefinition": "",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "decisionState",
                    "customLabel": "Decision State",
                    "labelOrientation": "Top",
                    "kind": "state-editor",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "actionState",
                    "customLabel": "Action State",
                    "labelOrientation": "Top",
                    "kind": "state-editor",
                    "visible": true,
                    "editable": true
                  }
                ]
              }
            ]
          }
        },
        "defaultFormatKey": {
          "default": "f5aec260-5d71-11ea-8553-c51caee8a5fd",
          "document": "89324a90-a7af-11e8-8662-71e48f0160fe",
          "card": "420b0560-1781-11ea-a38d-57607570dcb1",
          "board": "420b0560-1781-11ea-a38d-57607570dcb1"
        },
        "tableDefinitions": {}
      },
      "Actor": {
        "id": "view-actor",
        "name": "Actor",
        "parentId": "view-item",
        "createdBy": "gmckune",
        "createdOn": 1586302647398,
        "modifiedBy": "gmckune",
        "modifiedOn": 1586373219340,
        "modelName": "Actor",
        "icon": "fa fa-male",
        "color": "#000000",
        "viewProperties": {},
        "localTypes": {},
        "formatDefinitions": {
          "bd8898c0-7928-11ea-a214-1bab319abe04": {
            "id": "bd8898c0-7928-11ea-a214-1bab319abe04",
            "name": "Default Format Definition",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "kind": "text",
                  "visible": true,
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "kind",
                    "customLabel": "Kind",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "status",
                    "customLabel": "Status",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "id",
                    "customLabel": "ID",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "tags",
                    "customLabel": "Tags",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "parentId",
                    "customLabel": "Parent",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "createdBy",
                    "customLabel": "Created By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "createdOn",
                    "customLabel": "Created On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedBy",
                    "customLabel": "Modified By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedOn",
                    "customLabel": "Modified On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "loadPending",
                    "customLabel": "loadPending",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "hasValidationError",
                    "customLabel": "hasValidationError",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "$dirtyFields",
                    "customLabel": "$dirtyFields",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "__deletedProperty",
                    "customLabel": "__deletedProperty",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "itemIds",
                    "customLabel": "itemIds",
                    "labelOrientation": "Top",
                    "kind": "string",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "children",
                    "customLabel": "Children",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "approvedBy",
                    "customLabel": "approvedBy",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "text",
                    "editable": true
                  },
                  {
                    "propertyName": "approvedOn",
                    "customLabel": "approvedOn",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "date",
                    "editable": true
                  },
                  {
                    "propertyName": "rationale",
                    "customLabel": "rationale",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "text",
                    "editable": true
                  },
                  {
                    "propertyName": "alternatives",
                    "customLabel": "alternatives",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "costImpact",
                    "customLabel": "costImpact",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "scheduleImpact",
                    "customLabel": "scheduleImpact",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "otherImpacts",
                    "customLabel": "otherImpacts",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  }
                ]
              },
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "decisionState",
                    "customLabel": "decisionState",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "state-editor",
                    "editable": true
                  }
                ]
              }
            ]
          }
        },
        "defaultFormatKey": {
          "default": "bd8898c0-7928-11ea-a214-1bab319abe04"
        },
        "tableDefinitions": {}
      },
      "Analysis View Model": {
        "id": "view-analysis",
        "name": "Analysis View Model",
        "parentId": "View-Model-Definitions",
        "modelName": "Analysis",
        "icon": "",
        "color": "#000000",
        "localTypes": {},
        "viewProperties": {
          "id": {
            "inputType": {
              "type": "text",
              "options": {
                "isMultiLine": false
              }
            },
            "displayName": "ID"
          }
        },
        "formatDefinitions": {
          "2e6c7aa0-15d5-11ea-97d2-3bae97d5d967": {
            "id": "2e6c7aa0-15d5-11ea-97d2-3bae97d5d967",
            "name": "Format Definition",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "id",
                  "customLabel": "id",
                  "labelOrientation": "Top",
                  "kind": "text",
                  "visible": true,
                  "editable": false
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": []
              }
            ]
          }
        },
        "defaultFormatKey": {
          "document": "2e6c7aa0-15d5-11ea-97d2-3bae97d5d967"
        },
        "tableDefinitions": {},
        "itemIds": []
      },
      "Category View Model": {
        "id": "view-category",
        "name": "Category View Model",
        "parentId": "view-item",
        "modelName": "Category",
        "icon": "",
        "color": "#000000",
        "localTypes": {},
        "viewProperties": {},
        "formatDefinitions": {
          "7b2069a0-5d75-11ea-9932-bfa37f83df2f": {
            "id": "7b2069a0-5d75-11ea-9932-bfa37f83df2f",
            "name": "Default Format Definition",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "visible": true,
                  "kind": "text",
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "kind",
                    "customLabel": "Kind",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "status",
                    "customLabel": "Status",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "id",
                    "customLabel": "ID",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "tags",
                    "customLabel": "Tags",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "parentId",
                    "customLabel": "Parent",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "createdBy",
                    "customLabel": "Created By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "createdOn",
                    "customLabel": "Created On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedBy",
                    "customLabel": "Modified By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedOn",
                    "customLabel": "Modified On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "loadPending",
                    "customLabel": "loadPending",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "hasValidationError",
                    "customLabel": "hasValidationError",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "$dirtyFields",
                    "customLabel": "$dirtyFields",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "__deletedProperty",
                    "customLabel": "__deletedProperty",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "itemIds",
                    "customLabel": "itemIds",
                    "labelOrientation": "Top",
                    "kind": "string",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "children",
                    "customLabel": "Children",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": false
                  }
                ]
              }
            ]
          },
          "dce35040-15da-11ea-97d2-3bae97d5d967": {
            "id": "dce35040-15da-11ea-97d2-3bae97d5d967",
            "name": "Format Definition",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "kind": "text",
                  "visible": true,
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  }
                ]
              }
            ]
          }
        },
        "defaultFormatKey": {
          "default": "7b2069a0-5d75-11ea-9932-bfa37f83df2f",
          "document": "dce35040-15da-11ea-97d2-3bae97d5d967"
        },
        "tableDefinitions": {},
        "itemIds": []
      },
      "Decision View Model": {
        "id": "view-decision",
        "name": "Decision View Model",
        "parentId": "view-item",
        "modelName": "Decision",
        "icon": "fa fa-gavel",
        "color": "#add8e6",
        "localTypes": {},
        "viewProperties": {
          "decisionState": {
            "inputType": {
              "type": "state-editor",
              "options": {
                "options": [
                  "Proposed",
                  "In Analysis",
                  "In Review"
                ]
              }
            },
            "required": true,
            "default": "Proposed",
            "displayName": "DecisionState"
          },
          "approvedBy": {
            "inputType": {
              "type": "user-selector",
              "options": {}
            },
            "required": false,
            "default": null,
            "displayName": "approvedBy"
          },
          "approvedOn": {
            "inputType": {
              "type": "date",
              "options": {}
            },
            "required": false,
            "default": null,
            "displayName": "approvedOn"
          },
          "rationale": {
            "inputType": {
              "type": "text",
              "options": {
                "isMultiLine": false
              }
            },
            "required": false,
            "default": null,
            "displayName": "rationale"
          },
          "alternatives": {
            "inputType": {
              "type": "text",
              "options": {
                "isMultiLine": true
              }
            },
            "required": false,
            "default": null,
            "displayName": "alternatives"
          }
        },
        "formatDefinitions": {
          "7aa458a0-5d71-11ea-8553-c51caee8a5fd": {
            "id": "7aa458a0-5d71-11ea-8553-c51caee8a5fd",
            "name": "Default Format Definition",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "visible": true,
                  "kind": "text",
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "kind",
                    "customLabel": "Kind",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "status",
                    "customLabel": "Status",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "id",
                    "customLabel": "ID",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "tags",
                    "customLabel": "Tags",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "parentId",
                    "customLabel": "Parent",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "createdBy",
                    "customLabel": "Created By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "createdOn",
                    "customLabel": "Created On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedBy",
                    "customLabel": "Modified By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedOn",
                    "customLabel": "Modified On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "loadPending",
                    "customLabel": "loadPending",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "hasValidationError",
                    "customLabel": "hasValidationError",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "$dirtyFields",
                    "customLabel": "$dirtyFields",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "__deletedProperty",
                    "customLabel": "__deletedProperty",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "itemIds",
                    "customLabel": "itemIds",
                    "labelOrientation": "Top",
                    "kind": "string",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "children",
                    "customLabel": "Children",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "approvedBy",
                    "customLabel": "approvedBy",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "text",
                    "editable": true
                  },
                  {
                    "propertyName": "approvedOn",
                    "customLabel": "approvedOn",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "date",
                    "editable": true
                  },
                  {
                    "propertyName": "rationale",
                    "customLabel": "rationale",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "text",
                    "editable": true
                  },
                  {
                    "propertyName": "alternatives",
                    "customLabel": "alternatives",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "costImpact",
                    "customLabel": "costImpact",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "scheduleImpact",
                    "customLabel": "scheduleImpact",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "otherImpacts",
                    "customLabel": "otherImpacts",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  }
                ]
              },
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "decisionState",
                    "customLabel": "decisionState",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "state-editor",
                    "editable": true
                  }
                ]
              }
            ]
          },
          "89324a90-a7af-11e8-8662-71e48f0160fe": {
            "name": "New definition ",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "kind": "text",
                  "visible": true,
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  }
                ]
              }
            ],
            "id": "89324a90-a7af-11e8-8662-71e48f0160fe"
          }
        },
        "defaultFormatKey": {
          "default": "7aa458a0-5d71-11ea-8553-c51caee8a5fd",
          "document": "89324a90-a7af-11e8-8662-71e48f0160fe"
        },
        "tableDefinitions": {},
        "itemIds": []
      },
      "DocumentConfiguration View Model": {
        "id": "view-documentconfiguration",
        "name": "DocumentConfiguration View Model",
        "parentId": "view-item",
        "modelName": "DocumentConfiguration",
        "icon": "fa fa-file",
        "color": "#ffa500",
        "localTypes": {},
        "viewProperties": {},
        "formatDefinitions": {
          "dca3caa0-5d75-11ea-9d2a-81904e0f9ce1": {
            "id": "dca3caa0-5d75-11ea-9d2a-81904e0f9ce1",
            "name": "Default Format Definition",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "visible": true,
                  "kind": "text",
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "kind",
                    "customLabel": "Kind",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "status",
                    "customLabel": "Status",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "id",
                    "customLabel": "ID",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "tags",
                    "customLabel": "Tags",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "parentId",
                    "customLabel": "Parent",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "createdBy",
                    "customLabel": "Created By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "createdOn",
                    "customLabel": "Created On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedBy",
                    "customLabel": "Modified By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedOn",
                    "customLabel": "Modified On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "loadPending",
                    "customLabel": "loadPending",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "hasValidationError",
                    "customLabel": "hasValidationError",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "$dirtyFields",
                    "customLabel": "$dirtyFields",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "__deletedProperty",
                    "customLabel": "__deletedProperty",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "itemIds",
                    "customLabel": "itemIds",
                    "labelOrientation": "Top",
                    "kind": "string",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "children",
                    "customLabel": "Children",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "components",
                    "customLabel": "components",
                    "labelOrientation": "Top",
                    "visible": false,
                    "kind": "",
                    "editable": false
                  },
                  {
                    "propertyName": "delineated",
                    "customLabel": "delineated",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "boolean",
                    "editable": true
                  }
                ]
              }
            ]
          }
        },
        "defaultFormatKey": {
          "default": "dca3caa0-5d75-11ea-9d2a-81904e0f9ce1"
        },
        "tableDefinitions": {},
        "itemIds": []
      },
      "Domain": {
        "id": "view-domain",
        "name": "Domain",
        "parentId": "view-item",
        "createdBy": "gmckune",
        "createdOn": 1586302904733,
        "modifiedBy": "gmckune",
        "modifiedOn": 1586375436725,
        "modelName": "Domain",
        "icon": "fa fa-book",
        "color": "#000000",
        "viewProperties": {},
        "localTypes": {},
        "formatDefinitions": {
          "56ecc900-7929-11ea-9d30-c7b5e0ffd284": {
            "id": "56ecc900-7929-11ea-9d30-c7b5e0ffd284",
            "name": "Default Format Definition",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "kind": "text",
                  "visible": true,
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "kind",
                    "customLabel": "Kind",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "status",
                    "customLabel": "Status",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "id",
                    "customLabel": "ID",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "tags",
                    "customLabel": "Tags",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "parentId",
                    "customLabel": "Parent",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "createdBy",
                    "customLabel": "Created By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "createdOn",
                    "customLabel": "Created On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedBy",
                    "customLabel": "Modified By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedOn",
                    "customLabel": "Modified On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "loadPending",
                    "customLabel": "loadPending",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "hasValidationError",
                    "customLabel": "hasValidationError",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "$dirtyFields",
                    "customLabel": "$dirtyFields",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "__deletedProperty",
                    "customLabel": "__deletedProperty",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "itemIds",
                    "customLabel": "itemIds",
                    "labelOrientation": "Top",
                    "kind": "string",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "children",
                    "customLabel": "Children",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "approvedBy",
                    "customLabel": "approvedBy",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "text",
                    "editable": true
                  },
                  {
                    "propertyName": "approvedOn",
                    "customLabel": "approvedOn",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "date",
                    "editable": true
                  },
                  {
                    "propertyName": "rationale",
                    "customLabel": "rationale",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "text",
                    "editable": true
                  },
                  {
                    "propertyName": "alternatives",
                    "customLabel": "alternatives",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "costImpact",
                    "customLabel": "costImpact",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "scheduleImpact",
                    "customLabel": "scheduleImpact",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "otherImpacts",
                    "customLabel": "otherImpacts",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  }
                ]
              },
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "decisionState",
                    "customLabel": "decisionState",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "state-editor",
                    "editable": true
                  }
                ]
              }
            ]
          }
        },
        "defaultFormatKey": {
          "default": "56ecc900-7929-11ea-9d30-c7b5e0ffd284"
        },
        "tableDefinitions": {}
      },
      "Internal-Lost View Model": {
        "id": "view-internal-lost",
        "name": "Internal-Lost View Model",
        "parentId": "view-item",
        "modelName": "Internal-Lost",
        "icon": "fa fa-question",
        "color": "#000000",
        "localTypes": {},
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
              "type": "markdown",
              "options": {}
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
            "required": false,
            "default": "",
            "displayName": "Tags"
          },
          "parentId": {
            "inputType": {
              "type": "proxy-selector",
              "options": {
                "allowMultiSelect": false,
                "type": "Item",
                "useAdvancedSelector": false
              }
            },
            "required": true,
            "default": "ROOT",
            "displayName": "Parent"
          }
        },
        "formatDefinitions": {
          "929cad40-5d80-11ea-a066-2f1589f675a2": {
            "id": "929cad40-5d80-11ea-a066-2f1589f675a2",
            "name": "Default Format Definition",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "visible": true,
                  "kind": "text",
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "kind",
                    "customLabel": "Kind",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "status",
                    "customLabel": "Status",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "id",
                    "customLabel": "ID",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "tags",
                    "customLabel": "Tags",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "parentId",
                    "customLabel": "Parent",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "createdBy",
                    "customLabel": "Created By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "createdOn",
                    "customLabel": "Created On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedBy",
                    "customLabel": "Modified By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedOn",
                    "customLabel": "Modified On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "loadPending",
                    "customLabel": "loadPending",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "hasValidationError",
                    "customLabel": "hasValidationError",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "$dirtyFields",
                    "customLabel": "$dirtyFields",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "__deletedProperty",
                    "customLabel": "__deletedProperty",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "itemIds",
                    "customLabel": "itemIds",
                    "labelOrientation": "Top",
                    "kind": "string",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "children",
                    "customLabel": "Children",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": false
                  }
                ]
              }
            ]
          },
          "89324a90-a7af-11e8-8662-71e48f0160fe": {
            "name": "New definition ",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "kind": "text",
                  "visible": true,
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  }
                ]
              }
            ],
            "id": "89324a90-a7af-11e8-8662-71e48f0160fe"
          }
        },
        "defaultFormatKey": {
          "default": "929cad40-5d80-11ea-a066-2f1589f675a2",
          "document": "89324a90-a7af-11e8-8662-71e48f0160fe"
        },
        "tableDefinitions": {},
        "itemIds": []
      },
      "Internal View Model": {
        "id": "view-internal",
        "name": "Internal View Model",
        "parentId": "view-item",
        "modelName": "Internal",
        "icon": "fa fa-gears",
        "color": "#000000",
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
            "displayName": "Name",
            "name": "name"
          },
          "description": {
            "inputType": {
              "type": "markdown",
              "options": {}
            },
            "required": false,
            "default": "",
            "displayName": "Description",
            "name": "description"
          },
          "tags": {
            "inputType": {
              "type": "text",
              "options": {
                "isMultiLine": false
              }
            },
            "required": false,
            "default": "",
            "displayName": "Tags",
            "name": "tags"
          },
          "parentId": {
            "inputType": {
              "type": "proxy-selector",
              "options": {
                "allowMultiSelect": false,
                "type": "Item",
                "useAdvancedSelector": false
              }
            },
            "required": true,
            "default": "ROOT",
            "displayName": "Parent",
            "name": "parentId"
          }
        },
        "localTypes": {},
        "formatDefinitions": {
          "862f8640-5d80-11ea-a066-2f1589f675a2": {
            "id": "862f8640-5d80-11ea-a066-2f1589f675a2",
            "name": "Default Format Definition",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "visible": true,
                  "kind": "text",
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "kind",
                    "customLabel": "Kind",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "status",
                    "customLabel": "Status",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "id",
                    "customLabel": "ID",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "tags",
                    "customLabel": "Tags",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "parentId",
                    "customLabel": "Parent",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "createdBy",
                    "customLabel": "Created By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "createdOn",
                    "customLabel": "Created On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedBy",
                    "customLabel": "Modified By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedOn",
                    "customLabel": "Modified On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "loadPending",
                    "customLabel": "loadPending",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "hasValidationError",
                    "customLabel": "hasValidationError",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "$dirtyFields",
                    "customLabel": "$dirtyFields",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "__deletedProperty",
                    "customLabel": "__deletedProperty",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "itemIds",
                    "customLabel": "itemIds",
                    "labelOrientation": "Top",
                    "kind": "string",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "children",
                    "customLabel": "Children",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": false
                  }
                ]
              }
            ]
          },
          "89324a90-a7af-11e8-8662-71e48f0160fe": {
            "name": "New definition ",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "kind": "text",
                  "visible": true,
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  }
                ]
              }
            ],
            "id": "89324a90-a7af-11e8-8662-71e48f0160fe"
          }
        },
        "defaultFormatKey": {
          "default": "862f8640-5d80-11ea-a066-2f1589f675a2",
          "document": "89324a90-a7af-11e8-8662-71e48f0160fe"
        },
        "tableDefinitions": {}
      },
      "Issue View Model": {
        "id": "view-issue",
        "name": "Issue View Model",
        "parentId": "view-observation",
        "modelName": "Issue",
        "icon": "fa fa-exclamation-circle",
        "color": "#ff0000",
        "viewProperties": {
          "issueState": {
            "inputType": {
              "type": "state-editor",
              "options": {
                "options": [
                  "Observed",
                  "In Analysis",
                  "No Action"
                ]
              }
            },
            "required": false,
            "default": "Observed",
            "displayName": "issueState",
            "name": "issueState"
          },
          "relatedIssues": {
            "name": "relatedIssues",
            "displayName": "Related Issues",
            "inputType": {
              "type": "",
              "options": {}
            }
          },
          "analysisAction": {
            "inputType": {
              "type": "proxy-selector",
              "options": {
                "allowMultiSelect": false,
                "type": "Item",
                "useAdvancedSelector": false
              }
            },
            "required": true,
            "default": null,
            "displayName": "analysisAction",
            "name": "analysisAction"
          },
          "resolutionActions": {
            "inputType": {
              "type": "proxy-selector",
              "options": {
                "allowMultiSelect": true,
                "type": "Item",
                "useAdvancedSelector": false
              }
            },
            "required": true,
            "default": null,
            "displayName": "resolutionActions",
            "name": "resolutionActions"
          },
          "response": {
            "inputType": {
              "type": "markdown",
              "options": {
                "isMultiLine": true
              }
            },
            "required": false,
            "default": "",
            "displayName": "response",
            "name": "response"
          }
        },
        "localTypes": {},
        "formatDefinitions": {
          "bc5d43c0-5d7f-11ea-9d2a-81904e0f9ce1": {
            "id": "bc5d43c0-5d7f-11ea-9d2a-81904e0f9ce1",
            "name": "Default Format Definition",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "visible": true,
                  "kind": "text",
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "kind",
                    "customLabel": "Kind",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "status",
                    "customLabel": "Status",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "id",
                    "customLabel": "ID",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "tags",
                    "customLabel": "Tags",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "parentId",
                    "customLabel": "Work Context",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "createdBy",
                    "customLabel": "Created By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "createdOn",
                    "customLabel": "Created On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedBy",
                    "customLabel": "Modified By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedOn",
                    "customLabel": "Modified On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "loadPending",
                    "customLabel": "loadPending",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "hasValidationError",
                    "customLabel": "hasValidationError",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "$dirtyFields",
                    "customLabel": "$dirtyFields",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "__deletedProperty",
                    "customLabel": "__deletedProperty",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "itemIds",
                    "customLabel": "itemIds",
                    "labelOrientation": "Top",
                    "kind": "string",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "children",
                    "customLabel": "Children",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "observedBy",
                    "customLabel": "observedBy",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "text",
                    "editable": true
                  },
                  {
                    "propertyName": "observedOn",
                    "customLabel": "observedOn",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "date",
                    "editable": true
                  },
                  {
                    "propertyName": "context",
                    "customLabel": "context",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "relatedIssues",
                    "customLabel": "relatedIssues",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "analysisAction",
                    "customLabel": "analysisAction",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "resolutionActions",
                    "customLabel": "resolutionActions",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "response",
                    "customLabel": "response",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "markdown",
                    "editable": true
                  }
                ]
              },
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "issueState",
                    "customLabel": "issueState",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "state-editor",
                    "editable": true
                  }
                ]
              }
            ]
          },
          "89324a90-a7af-11e8-8662-71e48f0160fe": {
            "name": "New definition ",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "kind": "text",
                  "visible": true,
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "observedBy",
                    "customLabel": "Observed By",
                    "labelOrientation": "Left",
                    "kind": "text",
                    "tableDefinition": "",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "observedOn",
                    "customLabel": "Observed On",
                    "labelOrientation": "Left",
                    "kind": "date",
                    "tableDefinition": "",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "issueState",
                    "customLabel": "Issue State",
                    "labelOrientation": "Left",
                    "kind": "state-editor",
                    "tableDefinition": "",
                    "visible": true,
                    "editable": true
                  }
                ]
              }
            ],
            "id": "89324a90-a7af-11e8-8662-71e48f0160fe"
          }
        },
        "defaultFormatKey": {
          "default": "bc5d43c0-5d7f-11ea-9d2a-81904e0f9ce1",
          "document": "89324a90-a7af-11e8-8662-71e48f0160fe",
          "card": "89324a90-a7af-11e8-8662-71e48f0160fe",
          "board": "89324a90-a7af-11e8-8662-71e48f0160fe"
        },
        "tableDefinitions": {}
      },
      "Item View Model": {
        "id": "view-item",
        "name": "Item View Model",
        "parentId": "View-Model-Definitions",
        "modelName": "Item",
        "icon": "fa fa-sticky-note",
        "color": "#565656",
        "localTypes": {},
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
            "displayName": "Name",
            "name": "name"
          },
          "description": {
            "inputType": {
              "type": "markdown",
              "options": {}
            },
            "required": false,
            "default": "",
            "displayName": "Description",
            "name": "description"
          },
          "tags": {
            "inputType": {
              "type": "text",
              "options": {
                "isMultiLine": false
              }
            },
            "required": false,
            "default": "",
            "displayName": "Tags",
            "name": "tags"
          },
          "parentId": {
            "inputType": {
              "type": "proxy-selector",
              "options": {
                "allowMultiSelect": false,
                "type": "Item",
                "useAdvancedSelector": false
              }
            },
            "required": true,
            "default": "ROOT",
            "displayName": "Parent",
            "name": "parentId"
          },
          "children": {
            "name": "children",
            "displayName": "Children",
            "inputType": {
              "type": "",
              "options": {}
            }
          }
        },
        "formatDefinitions": {
          "cf123860-5a76-11ea-8c15-5359dfa592ed": {
            "name": "Default Format Definition",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "kind": "text",
                  "visible": true,
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "kind",
                    "customLabel": "Kind",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "status",
                    "customLabel": "Status",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "id",
                    "customLabel": "ID",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "tags",
                    "customLabel": "Tags",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "parentId",
                    "customLabel": "Parent",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "createdBy",
                    "customLabel": "Created By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "createdOn",
                    "customLabel": "Created On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedBy",
                    "customLabel": "Modified By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedOn",
                    "customLabel": "Modified On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "loadPending",
                    "customLabel": "loadPending",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "hasValidationError",
                    "customLabel": "hasValidationError",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "$dirtyFields",
                    "customLabel": "$dirtyFields",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "__deletedProperty",
                    "customLabel": "__deletedProperty",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "itemIds",
                    "customLabel": "itemIds",
                    "labelOrientation": "Top",
                    "kind": "string",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "children",
                    "customLabel": "Children",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": false
                  }
                ]
              }
            ],
            "id": "cf123860-5a76-11ea-8c15-5359dfa592ed"
          },
          "89324a90-a7af-11e8-8662-71e48f0160fe": {
            "name": "Default Item Format",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "kind": "text",
                  "visible": true,
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  }
                ]
              }
            ],
            "id": "89324a90-a7af-11e8-8662-71e48f0160fe"
          },
          "e17aebb0-2e42-11ea-845a-958260ba13c4": {
            "id": "e17aebb0-2e42-11ea-845a-958260ba13c4",
            "name": "Demo Children Table",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "visible": true,
                  "editable": true,
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
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "children",
                    "labelOrientation": "Top",
                    "kind": "",
                    "customLabel": "Children",
                    "tableDefinition": "3b4d68d0-e603-11e9-bf30-55b2f7a3af55",
                    "visible": true,
                    "editable": false
                  }
                ]
              }
            ]
          }
        },
        "defaultFormatKey": {
          "default": "cf123860-5a76-11ea-8c15-5359dfa592ed",
          "document": "89324a90-a7af-11e8-8662-71e48f0160fe",
          "card": "89324a90-a7af-11e8-8662-71e48f0160fe",
          "board": "89324a90-a7af-11e8-8662-71e48f0160fe"
        },
        "tableDefinitions": {
          "3b4d68d0-e603-11e9-bf30-55b2f7a3af55": {
            "id": "3b4d68d0-e603-11e9-bf30-55b2f7a3af55",
            "name": "Item Table",
            "columns": [
              "name",
              "id"
            ],
            "expandedFormat": {
              "column1": [],
              "column2": [],
              "column3": [],
              "column4": []
            }
          }
        }
      },
      "KeyEvent": {
        "id": "view-keyevent",
        "name": "KeyEvent",
        "parentId": "view-decision",
        "createdBy": "gmckune",
        "createdOn": 1566607211956,
        "modifiedBy": "gmckune",
        "modifiedOn": 1591737865749,
        "modelName": "KeyEvent",
        "icon": "fa fa-key",
        "color": "#000000",
        "viewProperties": {
          "DetectionMechanism": {
            "displayName": "DetectionMechanism",
            "inputType": {
              "type": "text",
              "options": {}
            },
            "name": "DetectionMechanism"
          },
          "EventInputData": {
            "displayName": "EventInputData",
            "inputType": {
              "type": "text",
              "options": {}
            },
            "name": "EventInputData"
          },
          "Responses": {
            "displayName": "Responses",
            "inputType": {
              "type": "text",
              "options": {}
            },
            "name": "Responses"
          },
          "EventOutputData": {
            "displayName": "EventOutputData",
            "inputType": {
              "type": "text",
              "options": {}
            },
            "name": "EventOutputData"
          }
        },
        "localTypes": {},
        "formatDefinitions": {
          "04b498d0-5d76-11ea-9d2a-81904e0f9ce1": {
            "id": "04b498d0-5d76-11ea-9d2a-81904e0f9ce1",
            "name": "Default Format Definition",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "visible": true,
                  "kind": "text",
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "kind",
                    "customLabel": "Kind",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "status",
                    "customLabel": "Status",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "id",
                    "customLabel": "ID",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "tags",
                    "customLabel": "Tags",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "parentId",
                    "customLabel": "Parent",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "createdBy",
                    "customLabel": "Created By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "createdOn",
                    "customLabel": "Created On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedBy",
                    "customLabel": "Modified By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedOn",
                    "customLabel": "Modified On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "loadPending",
                    "customLabel": "loadPending",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "hasValidationError",
                    "customLabel": "hasValidationError",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "$dirtyFields",
                    "customLabel": "$dirtyFields",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "__deletedProperty",
                    "customLabel": "__deletedProperty",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "itemIds",
                    "customLabel": "itemIds",
                    "labelOrientation": "Top",
                    "kind": "string",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "children",
                    "customLabel": "Children",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "approvedBy",
                    "customLabel": "approvedBy",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "text",
                    "editable": true
                  },
                  {
                    "propertyName": "approvedOn",
                    "customLabel": "approvedOn",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "date",
                    "editable": true
                  },
                  {
                    "propertyName": "rationale",
                    "customLabel": "rationale",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "text",
                    "editable": true
                  },
                  {
                    "propertyName": "alternatives",
                    "customLabel": "alternatives",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "costImpact",
                    "customLabel": "costImpact",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "scheduleImpact",
                    "customLabel": "scheduleImpact",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "otherImpacts",
                    "customLabel": "otherImpacts",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "DetectionMechanism",
                    "customLabel": "DetectionMechanism",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "text",
                    "editable": true
                  },
                  {
                    "propertyName": "EventInputData",
                    "customLabel": "EventInputData",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "text",
                    "editable": true
                  },
                  {
                    "propertyName": "Responses",
                    "customLabel": "Responses",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "text",
                    "editable": true
                  },
                  {
                    "propertyName": "EventOutputData",
                    "customLabel": "EventOutputData",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "text",
                    "editable": true
                  }
                ]
              },
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "decisionState",
                    "customLabel": "decisionState",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "state-editor",
                    "editable": true
                  }
                ]
              }
            ]
          },
          "89324a90-a7af-11e8-8662-71e48f0160fe": {
            "name": "New definition",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "kind": "text",
                  "visible": true,
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "name",
                    "customLabel": "name",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "tableDefinition": "",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "DetectionMechanism",
                    "customLabel": "DetectionMechanism",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "EventInputData",
                    "customLabel": "EventInputData",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "Responses",
                    "customLabel": "Responses",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "EventOutputData",
                    "customLabel": "EventOutputData",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": true
                  }
                ]
              }
            ],
            "id": "89324a90-a7af-11e8-8662-71e48f0160fe"
          }
        },
        "defaultFormatKey": {
          "default": "04b498d0-5d76-11ea-9d2a-81904e0f9ce1",
          "document": "89324a90-a7af-11e8-8662-71e48f0160fe"
        },
        "tableDefinitions": {
          "b1090aa0-fb86-11e9-be56-311e0135452a": {
            "id": "b1090aa0-fb86-11e9-be56-311e0135452a",
            "name": "KeyEventInfo",
            "columns": [
              "name",
              "DetectionMechanism",
              "EventInputData",
              "Responses",
              "EventOutputData"
            ],
            "expandedFormat": {
              "column1": [],
              "column2": [],
              "column3": [],
              "column4": []
            }
          },
          "5b7cf180-aa97-11ea-b459-333ae1bfee22": {
            "id": "5b7cf180-aa97-11ea-b459-333ae1bfee22",
            "name": "KeyEventTableForUseCases",
            "columns": [
              "name",
              "DetectionMechanism",
              "Responses"
            ],
            "expandedFormat": {
              "column1": [],
              "column2": [],
              "column3": [],
              "column4": []
            }
          }
        }
      },
      "KeyEventDictionary": {
        "id": "view-keyeventdictionary",
        "name": "KeyEventDictionary",
        "parentId": "view-item",
        "createdBy": "gmckune",
        "createdOn": 1572491164827,
        "modifiedBy": "gmckune",
        "modifiedOn": 1586376069127,
        "modelName": "KeyEventDictionary",
        "icon": "fa fa-th-list",
        "color": "#000000",
        "viewProperties": {
          "KeyEvents": {
            "displayName": "KeyEvents",
            "inputType": {
              "type": "proxy-selector",
              "options": {}
            },
            "name": "KeyEvents"
          }
        },
        "localTypes": {},
        "formatDefinitions": {
          "815abbc0-5d77-11ea-9d2a-81904e0f9ce1": {
            "id": "815abbc0-5d77-11ea-9d2a-81904e0f9ce1",
            "name": "Default Format Definition",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "visible": true,
                  "kind": "text",
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "kind",
                    "customLabel": "Kind",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "status",
                    "customLabel": "Status",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "id",
                    "customLabel": "ID",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "tags",
                    "customLabel": "Tags",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "parentId",
                    "customLabel": "Parent",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "createdBy",
                    "customLabel": "Created By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "createdOn",
                    "customLabel": "Created On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedBy",
                    "customLabel": "Modified By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedOn",
                    "customLabel": "Modified On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "loadPending",
                    "customLabel": "loadPending",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "hasValidationError",
                    "customLabel": "hasValidationError",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "$dirtyFields",
                    "customLabel": "$dirtyFields",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "__deletedProperty",
                    "customLabel": "__deletedProperty",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "itemIds",
                    "customLabel": "itemIds",
                    "labelOrientation": "Top",
                    "kind": "string",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "children",
                    "customLabel": "Children",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "approvedBy",
                    "customLabel": "approvedBy",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "text",
                    "editable": true
                  },
                  {
                    "propertyName": "approvedOn",
                    "customLabel": "approvedOn",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "date",
                    "editable": true
                  },
                  {
                    "propertyName": "rationale",
                    "customLabel": "rationale",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "text",
                    "editable": true
                  },
                  {
                    "propertyName": "alternatives",
                    "customLabel": "alternatives",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "costImpact",
                    "customLabel": "costImpact",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "scheduleImpact",
                    "customLabel": "scheduleImpact",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "otherImpacts",
                    "customLabel": "otherImpacts",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "KeyEvents",
                    "customLabel": "KeyEvents",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  }
                ]
              },
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "decisionState",
                    "customLabel": "decisionState",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "state-editor",
                    "editable": true
                  }
                ]
              }
            ]
          },
          "606b9540-fb8b-11e9-8df2-e9413ca0bcbd": {
            "name": "New definition",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "kind": "text",
                  "visible": true,
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "KeyEvents",
                    "customLabel": "KeyEvents",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": true,
                    "editable": true,
                    "tableDefinition": "b1090aa0-fb86-11e9-be56-311e0135452a"
                  }
                ]
              }
            ],
            "id": "606b9540-fb8b-11e9-8df2-e9413ca0bcbd"
          }
        },
        "defaultFormatKey": {
          "default": "815abbc0-5d77-11ea-9d2a-81904e0f9ce1",
          "document": "606b9540-fb8b-11e9-8df2-e9413ca0bcbd"
        },
        "tableDefinitions": {
          "8446d010-fb8b-11e9-8df2-e9413ca0bcbd": {
            "id": "8446d010-fb8b-11e9-8df2-e9413ca0bcbd",
            "name": "KeyEventTable",
            "columns": [
              "KeyEvents"
            ],
            "expandedFormat": {
              "column1": [],
              "column2": [],
              "column3": [],
              "column4": []
            }
          }
        }
      },
      "KoheseModel View Model": {
        "id": "view-kohesemodel",
        "name": "KoheseModel View Model",
        "parentId": "view-item",
        "modelName": "KoheseModel",
        "icon": "fa fa-sitemap",
        "color": "#000000",
        "viewProperties": {},
        "localTypes": {
          "PropertyType": {
            "name": "PropertyType",
            "modelName": "PropertyType",
            "icon": "",
            "color": "#000000",
            "viewProperties": {
              "type": {
                "name": "type",
                "displayName": "Type",
                "inputType": {
                  "type": "text",
                  "options": {}
                }
              },
              "required": {
                "name": "required",
                "displayName": "Required",
                "inputType": {
                  "type": "boolean",
                  "options": {}
                }
              },
              "id": {
                "name": "id",
                "displayName": "Id",
                "inputType": {
                  "type": "boolean",
                  "options": {}
                }
              },
              "derived": {
                "name": "derived",
                "displayName": "Derived",
                "inputType": {
                  "type": "boolean",
                  "options": {}
                }
              },
              "calculated": {
                "name": "calculated",
                "displayName": "Calculated",
                "inputType": {
                  "type": "text",
                  "options": {}
                }
              },
              "hidden": {
                "name": "hidden",
                "displayName": "Hidden",
                "inputType": {
                  "type": "boolean",
                  "options": {}
                }
              }
            },
            "formatDefinitions": {
              "d8664dc0-89c4-11ea-95d5-01975b059115": {
                "id": "d8664dc0-89c4-11ea-95d5-01975b059115",
                "name": "Default Format Definition",
                "header": {
                  "kind": "header",
                  "contents": []
                },
                "containers": [
                  {
                    "kind": "list",
                    "contents": [
                      {
                        "propertyName": "type",
                        "customLabel": "Type",
                        "labelOrientation": "Top",
                        "kind": "text",
                        "visible": true,
                        "editable": true
                      },
                      {
                        "propertyName": "required",
                        "customLabel": "Required",
                        "labelOrientation": "Top",
                        "kind": "boolean",
                        "visible": true,
                        "editable": true
                      },
                      {
                        "propertyName": "id",
                        "customLabel": "Id",
                        "labelOrientation": "Top",
                        "kind": "boolean",
                        "visible": true,
                        "editable": true
                      },
                      {
                        "propertyName": "derived",
                        "customLabel": "Derived",
                        "labelOrientation": "Top",
                        "kind": "boolean",
                        "visible": true,
                        "editable": true
                      },
                      {
                        "propertyName": "calculated",
                        "customLabel": "Calculated",
                        "labelOrientation": "Top",
                        "kind": "text",
                        "visible": true,
                        "editable": true
                      },
                      {
                        "propertyName": "hidden",
                        "customLabel": "Hidden",
                        "labelOrientation": "Top",
                        "kind": "boolean",
                        "visible": true,
                        "editable": true
                      }
                    ]
                  }
                ]
              }
            },
            "defaultFormatKey": {
              "default": "d8664dc0-89c4-11ea-95d5-01975b059115"
            },
            "tableDefinitions": {}
          },
          "RelationType": {
            "name": "RelationType",
            "modelName": "RelationType",
            "icon": "",
            "color": "#000000",
            "viewProperties": {
              "kind": {
                "name": "kind",
                "displayName": "Kind",
                "inputType": {
                  "type": "text",
                  "options": {}
                }
              },
              "foreignKey": {
                "name": "foreignKey",
                "displayName": "Foreign Key",
                "inputType": {
                  "type": "text",
                  "options": {}
                }
              },
              "contained": {
                "name": "contained",
                "displayName": "Contained",
                "inputType": {
                  "type": "boolean",
                  "options": {}
                }
              }
            },
            "formatDefinitions": {
              "be2028d0-89c6-11ea-95d5-01975b059115": {
                "id": "be2028d0-89c6-11ea-95d5-01975b059115",
                "name": "Default Format Definition",
                "header": {
                  "kind": "header",
                  "contents": []
                },
                "containers": [
                  {
                    "kind": "list",
                    "contents": [
                      {
                        "propertyName": "kind",
                        "customLabel": "Kind",
                        "labelOrientation": "Top",
                        "kind": "text",
                        "visible": true,
                        "editable": true
                      },
                      {
                        "propertyName": "foreignKey",
                        "customLabel": "Foreign Key",
                        "labelOrientation": "Top",
                        "kind": "text",
                        "visible": true,
                        "editable": true
                      },
                      {
                        "propertyName": "contained",
                        "customLabel": "Contained",
                        "labelOrientation": "Top",
                        "kind": "boolean",
                        "visible": true,
                        "editable": true
                      }
                    ]
                  }
                ]
              }
            },
            "defaultFormatKey": {
              "default": "be2028d0-89c6-11ea-95d5-01975b059115"
            },
            "tableDefinitions": {}
          }
        },
        "formatDefinitions": {
          "ce7b13c0-6964-11ea-80c5-0b0cc7c6ec96": {
            "name": "Default Format Definition",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "kind": "text",
                  "visible": true,
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "kind",
                    "customLabel": "Kind",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "status",
                    "customLabel": "Status",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "id",
                    "customLabel": "ID",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "tags",
                    "customLabel": "Tags",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "parentId",
                    "customLabel": "Parent",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "createdBy",
                    "customLabel": "Created By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "createdOn",
                    "customLabel": "Created On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedBy",
                    "customLabel": "Modified By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedOn",
                    "customLabel": "Modified On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "loadPending",
                    "customLabel": "loadPending",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "hasValidationError",
                    "customLabel": "hasValidationError",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "$dirtyFields",
                    "customLabel": "$dirtyFields",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "__deletedProperty",
                    "customLabel": "__deletedProperty",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "itemIds",
                    "customLabel": "itemIds",
                    "labelOrientation": "Top",
                    "kind": "string",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "children",
                    "customLabel": "Children",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": false
                  }
                ]
              }
            ],
            "id": "ce7b13c0-6964-11ea-80c5-0b0cc7c6ec96"
          }
        },
        "defaultFormatKey": {
          "default": "ce7b13c0-6964-11ea-80c5-0b0cc7c6ec96"
        },
        "tableDefinitions": {}
      },
      "KoheseUser View Model": {
        "id": "view-koheseuser",
        "name": "KoheseUser View Model",
        "parentId": "view-item",
        "modelName": "KoheseUser",
        "icon": "fa fa-user",
        "color": "#000000",
        "localTypes": {},
        "viewProperties": {
          "password": {
            "inputType": {
              "type": "text",
              "options": {
                "isMultiLine": false
              }
            },
            "displayName": "Password"
          },
          "email": {
            "inputType": {
              "type": "text",
              "options": {
                "isMultiLine": false
              }
            },
            "displayName": "E-Mail Address"
          },
          "username": {
            "inputType": {
              "type": "text",
              "options": {
                "isMultiLine": false
              }
            },
            "displayName": "Username"
          }
        },
        "formatDefinitions": {
          "99cb2460-5d77-11ea-9d2a-81904e0f9ce1": {
            "id": "99cb2460-5d77-11ea-9d2a-81904e0f9ce1",
            "name": "Default Format Definition",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "visible": true,
                  "kind": "text",
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "kind",
                    "customLabel": "Kind",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "status",
                    "customLabel": "Status",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "id",
                    "customLabel": "ID",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "tags",
                    "customLabel": "Tags",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "parentId",
                    "customLabel": "Parent",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "createdBy",
                    "customLabel": "Created By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "createdOn",
                    "customLabel": "Created On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedBy",
                    "customLabel": "Modified By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedOn",
                    "customLabel": "Modified On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "loadPending",
                    "customLabel": "loadPending",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "hasValidationError",
                    "customLabel": "hasValidationError",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "$dirtyFields",
                    "customLabel": "$dirtyFields",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "__deletedProperty",
                    "customLabel": "__deletedProperty",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "itemIds",
                    "customLabel": "itemIds",
                    "labelOrientation": "Top",
                    "kind": "string",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "children",
                    "customLabel": "Children",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "password",
                    "customLabel": "password",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "maskedString",
                    "editable": true
                  },
                  {
                    "propertyName": "email",
                    "customLabel": "email",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "text",
                    "editable": true
                  },
                  {
                    "propertyName": "username",
                    "customLabel": "username",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "text",
                    "editable": false
                  }
                ]
              }
            ]
          },
          "2f3dd260-15eb-11ea-97d2-3bae97d5d967": {
            "id": "2f3dd260-15eb-11ea-97d2-3bae97d5d967",
            "name": "Format Definition",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "kind": "text",
                  "visible": true,
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  }
                ]
              }
            ]
          }
        },
        "defaultFormatKey": {
          "default": "99cb2460-5d77-11ea-9d2a-81904e0f9ce1",
          "document": "2f3dd260-15eb-11ea-97d2-3bae97d5d967"
        },
        "tableDefinitions": {},
        "itemIds": []
      },
      "KoheseView View Model": {
        "id": "view-koheseview",
        "name": "KoheseView View Model",
        "parentId": "view-item",
        "modelName": "KoheseView",
        "icon": "fa fa-desktop",
        "color": "#000000",
        "viewProperties": {},
        "localTypes": {},
        "formatDefinitions": {
          "03cf44b0-6965-11ea-80c5-0b0cc7c6ec96": {
            "name": "Default Format Definition",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "kind": "text",
                  "visible": true,
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "kind",
                    "customLabel": "Kind",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "status",
                    "customLabel": "Status",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "id",
                    "customLabel": "ID",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "tags",
                    "customLabel": "Tags",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "parentId",
                    "customLabel": "Parent",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "createdBy",
                    "customLabel": "Created By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "createdOn",
                    "customLabel": "Created On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedBy",
                    "customLabel": "Modified By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedOn",
                    "customLabel": "Modified On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "loadPending",
                    "customLabel": "loadPending",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "hasValidationError",
                    "customLabel": "hasValidationError",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "$dirtyFields",
                    "customLabel": "$dirtyFields",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "__deletedProperty",
                    "customLabel": "__deletedProperty",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "itemIds",
                    "customLabel": "itemIds",
                    "labelOrientation": "Top",
                    "kind": "string",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "children",
                    "customLabel": "Children",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": false
                  }
                ]
              }
            ],
            "id": "03cf44b0-6965-11ea-80c5-0b0cc7c6ec96"
          }
        },
        "defaultFormatKey": {
          "default": "03cf44b0-6965-11ea-80c5-0b0cc7c6ec96"
        },
        "tableDefinitions": {}
      },
      "Observation View Model": {
        "id": "view-observation",
        "name": "Observation View Model",
        "parentId": "view-item",
        "modelName": "Observation",
        "icon": "fa fa-comment",
        "color": "#bcc00a",
        "viewProperties": {
          "observedBy": {
            "inputType": {
              "type": "user-selector",
              "options": {}
            },
            "required": false,
            "default": null,
            "displayName": "observedBy",
            "name": "observedBy"
          },
          "observedOn": {
            "inputType": {
              "type": "date",
              "options": {}
            },
            "required": false,
            "default": null,
            "displayName": "observedOn",
            "name": "observedOn"
          },
          "context": {
            "inputType": {
              "type": "proxy-selector",
              "options": {
                "allowMultiSelect": false,
                "type": "Item",
                "useAdvancedSelector": false
              }
            },
            "required": true,
            "default": "ROOT",
            "displayName": "context",
            "name": "context"
          }
        },
        "localTypes": {},
        "formatDefinitions": {
          "7c619f60-5d79-11ea-9d2a-81904e0f9ce1": {
            "id": "7c619f60-5d79-11ea-9d2a-81904e0f9ce1",
            "name": "Default Format Definition",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "visible": true,
                  "kind": "text",
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "kind",
                    "customLabel": "Kind",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "status",
                    "customLabel": "Status",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "id",
                    "customLabel": "ID",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "tags",
                    "customLabel": "Tags",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "parentId",
                    "customLabel": "Work Context",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "createdBy",
                    "customLabel": "Created By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "createdOn",
                    "customLabel": "Created On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedBy",
                    "customLabel": "Modified By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedOn",
                    "customLabel": "Modified On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "loadPending",
                    "customLabel": "loadPending",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "hasValidationError",
                    "customLabel": "hasValidationError",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "$dirtyFields",
                    "customLabel": "$dirtyFields",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "__deletedProperty",
                    "customLabel": "__deletedProperty",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "itemIds",
                    "customLabel": "itemIds",
                    "labelOrientation": "Top",
                    "kind": "string",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "children",
                    "customLabel": "Children",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "observedBy",
                    "customLabel": "observedBy",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "text",
                    "editable": true
                  },
                  {
                    "propertyName": "observedOn",
                    "customLabel": "observedOn",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "date",
                    "editable": true
                  },
                  {
                    "propertyName": "context",
                    "customLabel": "context",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  }
                ]
              }
            ]
          },
          "89324a90-a7af-11e8-8662-71e48f0160fe": {
            "name": "New definition ",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "kind": "text",
                  "visible": true,
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "observedBy",
                    "customLabel": "Observed By",
                    "labelOrientation": "Left",
                    "kind": "text",
                    "tableDefinition": "",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "observedOn",
                    "customLabel": "Observed On",
                    "labelOrientation": "Left",
                    "kind": "date",
                    "tableDefinition": "",
                    "visible": true,
                    "editable": true
                  }
                ]
              }
            ],
            "id": "89324a90-a7af-11e8-8662-71e48f0160fe"
          }
        },
        "defaultFormatKey": {
          "default": "7c619f60-5d79-11ea-9d2a-81904e0f9ce1",
          "document": "89324a90-a7af-11e8-8662-71e48f0160fe",
          "card": "89324a90-a7af-11e8-8662-71e48f0160fe",
          "board": "89324a90-a7af-11e8-8662-71e48f0160fe"
        },
        "tableDefinitions": {}
      },
      "Project View Model": {
        "id": "view-project",
        "name": "Project View Model",
        "parentId": "view-item",
        "modelName": "Project",
        "icon": "fa fa-pie-chart",
        "color": "#800080",
        "localTypes": {},
        "viewProperties": {
          "projectItems": {
            "inputType": {
              "type": "proxy-selector",
              "options": {
                "allowMultiSelect": true,
                "type": "Item",
                "useAdvancedSelector": false
              }
            },
            "required": false,
            "default": null,
            "displayName": "Project Items"
          }
        },
        "formatDefinitions": {
          "b4dbc110-5d7c-11ea-9d2a-81904e0f9ce1": {
            "id": "b4dbc110-5d7c-11ea-9d2a-81904e0f9ce1",
            "name": "Default Format Definition",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "visible": true,
                  "kind": "text",
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "kind",
                    "customLabel": "Kind",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "status",
                    "customLabel": "Status",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "id",
                    "customLabel": "ID",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "tags",
                    "customLabel": "Tags",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "parentId",
                    "customLabel": "Parent",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "createdBy",
                    "customLabel": "Created By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "createdOn",
                    "customLabel": "Created On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedBy",
                    "customLabel": "Modified By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedOn",
                    "customLabel": "Modified On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "loadPending",
                    "customLabel": "loadPending",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "hasValidationError",
                    "customLabel": "hasValidationError",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "$dirtyFields",
                    "customLabel": "$dirtyFields",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "__deletedProperty",
                    "customLabel": "__deletedProperty",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "itemIds",
                    "customLabel": "itemIds",
                    "labelOrientation": "Top",
                    "kind": "string",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "children",
                    "customLabel": "Children",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "projectItems",
                    "customLabel": "projectItems",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  }
                ]
              }
            ]
          },
          "89324a90-a7af-11e8-8662-71e48f0160fe": {
            "name": "New definition ",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "kind": "text",
                  "visible": true,
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  }
                ]
              }
            ],
            "id": "89324a90-a7af-11e8-8662-71e48f0160fe"
          }
        },
        "defaultFormatKey": {
          "default": "b4dbc110-5d7c-11ea-9d2a-81904e0f9ce1",
          "document": "89324a90-a7af-11e8-8662-71e48f0160fe"
        },
        "tableDefinitions": {},
        "itemIds": []
      },
      "ReportDefinition View Model": {
        "id": "view-reportdefinition",
        "name": "ReportDefinition View Model",
        "parentId": "view-item",
        "modelName": "ReportDefinition",
        "icon": "",
        "color": "#000000",
        "localTypes": {},
        "viewProperties": {},
        "formatDefinitions": {
          "c3c7a3b0-5d7c-11ea-9d2a-81904e0f9ce1": {
            "id": "c3c7a3b0-5d7c-11ea-9d2a-81904e0f9ce1",
            "name": "Default Format Definition",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "visible": true,
                  "kind": "text",
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "kind",
                    "customLabel": "Kind",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "status",
                    "customLabel": "Status",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "id",
                    "customLabel": "ID",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "tags",
                    "customLabel": "Tags",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "parentId",
                    "customLabel": "Parent",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "createdBy",
                    "customLabel": "Created By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "createdOn",
                    "customLabel": "Created On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedBy",
                    "customLabel": "Modified By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedOn",
                    "customLabel": "Modified On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "loadPending",
                    "customLabel": "loadPending",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "hasValidationError",
                    "customLabel": "hasValidationError",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "$dirtyFields",
                    "customLabel": "$dirtyFields",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "__deletedProperty",
                    "customLabel": "__deletedProperty",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "itemIds",
                    "customLabel": "itemIds",
                    "labelOrientation": "Top",
                    "kind": "string",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "children",
                    "customLabel": "Children",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "entryPoints",
                    "customLabel": "entryPoints",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "typeFormats",
                    "customLabel": "typeFormats",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  }
                ]
              }
            ]
          },
          "260a0f00-15ec-11ea-97d2-3bae97d5d967": {
            "id": "260a0f00-15ec-11ea-97d2-3bae97d5d967",
            "name": "Format Definition",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "kind": "text",
                  "visible": true,
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  }
                ]
              }
            ]
          }
        },
        "defaultFormatKey": {
          "default": "c3c7a3b0-5d7c-11ea-9d2a-81904e0f9ce1",
          "document": "260a0f00-15ec-11ea-97d2-3bae97d5d967"
        },
        "tableDefinitions": {},
        "itemIds": []
      },
      "Repository View Model": {
        "id": "view-repository",
        "name": "Repository View Model",
        "parentId": "view-item",
        "modelName": "Repository",
        "icon": "fa fa-database",
        "color": "#660000",
        "localTypes": {},
        "viewProperties": {},
        "formatDefinitions": {
          "d1bec610-5d7c-11ea-9d2a-81904e0f9ce1": {
            "id": "d1bec610-5d7c-11ea-9d2a-81904e0f9ce1",
            "name": "Default Format Definition",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "visible": true,
                  "kind": "text",
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "kind",
                    "customLabel": "Kind",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "status",
                    "customLabel": "Status",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "id",
                    "customLabel": "ID",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "tags",
                    "customLabel": "Tags",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "parentId",
                    "customLabel": "Parent",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "createdBy",
                    "customLabel": "Created By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "createdOn",
                    "customLabel": "Created On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedBy",
                    "customLabel": "Modified By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedOn",
                    "customLabel": "Modified On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "loadPending",
                    "customLabel": "loadPending",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "hasValidationError",
                    "customLabel": "hasValidationError",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "$dirtyFields",
                    "customLabel": "$dirtyFields",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "__deletedProperty",
                    "customLabel": "__deletedProperty",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "itemIds",
                    "customLabel": "itemIds",
                    "labelOrientation": "Top",
                    "kind": "string",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "children",
                    "customLabel": "Children",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "origin",
                    "customLabel": "origin",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "text",
                    "editable": true
                  },
                  {
                    "propertyName": "mounted",
                    "customLabel": "mounted",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "boolean",
                    "editable": true
                  }
                ]
              }
            ]
          },
          "89324a90-a7af-11e8-8662-71e48f0160fe": {
            "name": "New definition ",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "kind": "text",
                  "visible": true,
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  }
                ]
              }
            ],
            "id": "89324a90-a7af-11e8-8662-71e48f0160fe"
          }
        },
        "defaultFormatKey": {
          "default": "d1bec610-5d7c-11ea-9d2a-81904e0f9ce1",
          "document": "89324a90-a7af-11e8-8662-71e48f0160fe"
        },
        "tableDefinitions": {},
        "itemIds": []
      },
      "Task View Model": {
        "id": "view-task",
        "name": "Task View Model",
        "parentId": "view-item",
        "modelName": "Task",
        "icon": "fa fa-tasks",
        "color": "#008000",
        "viewProperties": {
          "taskState": {
            "inputType": {
              "type": "state-editor",
              "options": {
                "options": [
                  "Proposed",
                  "Accepted",
                  "In Work"
                ]
              }
            },
            "required": false,
            "default": "Proposed",
            "displayName": "taskState",
            "name": "taskState"
          },
          "assignedTo": {
            "inputType": {
              "type": "user-selector",
              "options": {}
            },
            "required": false,
            "default": null,
            "displayName": "assignedTo",
            "name": "assignedTo"
          },
          "estimatedStart": {
            "inputType": {
              "type": "date",
              "options": {}
            },
            "required": false,
            "default": null,
            "displayName": "estimatedStart",
            "name": "estimatedStart"
          },
          "estimatedCompletion": {
            "inputType": {
              "type": "date",
              "options": {}
            },
            "required": false,
            "default": null,
            "displayName": "estimatedCompletion",
            "name": "estimatedCompletion"
          },
          "estimatedHoursEffort": {
            "inputType": {
              "type": "number",
              "options": {
                "isMultiLine": false
              }
            },
            "required": false,
            "default": "",
            "displayName": "estimatedHoursEffort",
            "name": "estimatedHoursEffort"
          },
          "actualStart": {
            "inputType": {
              "type": "date",
              "options": {}
            },
            "required": false,
            "default": null,
            "displayName": "actualStart",
            "name": "actualStart"
          },
          "actualCompletion": {
            "inputType": {
              "type": "date",
              "options": {}
            },
            "required": false,
            "default": null,
            "displayName": "actualCompletion",
            "name": "actualCompletion"
          },
          "remainingHoursEffort": {
            "inputType": {
              "type": "number",
              "options": {
                "isMultiLine": false
              }
            },
            "required": false,
            "default": "",
            "displayName": "remainingHoursEffort",
            "name": "remainingHoursEffort"
          },
          "actualHoursEffort": {
            "inputType": {
              "type": "number",
              "options": {
                "isMultiLine": false
              }
            },
            "required": false,
            "default": "",
            "displayName": "actualHoursEffort",
            "name": "actualHoursEffort"
          },
          "predecessors": {
            "inputType": {
              "type": "proxy-selector",
              "options": {
                "allowMultiSelect": true,
                "type": "Item",
                "useAdvancedSelector": false
              }
            },
            "required": false,
            "default": null,
            "displayName": "predecessors",
            "name": "predecessors"
          }
        },
        "localTypes": {},
        "formatDefinitions": {
          "dc8f7b20-5d7c-11ea-9d2a-81904e0f9ce1": {
            "id": "dc8f7b20-5d7c-11ea-9d2a-81904e0f9ce1",
            "name": "Default Format Definition",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "visible": true,
                  "kind": "text",
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "kind",
                    "customLabel": "Kind",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "status",
                    "customLabel": "Status",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "id",
                    "customLabel": "ID",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "tags",
                    "customLabel": "Tags",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "parentId",
                    "customLabel": "Parent",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "createdBy",
                    "customLabel": "Created By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "createdOn",
                    "customLabel": "Created On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedBy",
                    "customLabel": "Modified By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedOn",
                    "customLabel": "Modified On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "loadPending",
                    "customLabel": "loadPending",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "hasValidationError",
                    "customLabel": "hasValidationError",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "$dirtyFields",
                    "customLabel": "$dirtyFields",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "__deletedProperty",
                    "customLabel": "__deletedProperty",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "itemIds",
                    "customLabel": "itemIds",
                    "labelOrientation": "Top",
                    "kind": "string",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "children",
                    "customLabel": "Children",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "predecessors",
                    "customLabel": "predecessors",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "assignedTo",
                    "customLabel": "assignedTo",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "text",
                    "editable": true
                  },
                  {
                    "propertyName": "estimatedStart",
                    "customLabel": "estimatedStart",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "date",
                    "editable": true
                  },
                  {
                    "propertyName": "estimatedCompletion",
                    "customLabel": "estimatedCompletion",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "date",
                    "editable": true
                  },
                  {
                    "propertyName": "estimatedHoursEffort",
                    "customLabel": "estimatedHoursEffort",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "number",
                    "editable": true
                  },
                  {
                    "propertyName": "actualStart",
                    "customLabel": "actualStart",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "date",
                    "editable": true
                  },
                  {
                    "propertyName": "actualCompletion",
                    "customLabel": "actualCompletion",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "date",
                    "editable": true
                  },
                  {
                    "propertyName": "remainingHoursEffort",
                    "customLabel": "remainingHoursEffort",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "number",
                    "editable": true
                  },
                  {
                    "propertyName": "actualHoursEffort",
                    "customLabel": "actualHoursEffort",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "number",
                    "editable": true
                  }
                ]
              },
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "taskState",
                    "customLabel": "taskState",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "state-editor",
                    "editable": true
                  }
                ]
              }
            ]
          },
          "89324a90-a7af-11e8-8662-71e48f0160fe": {
            "name": "New definition ",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "kind": "text",
                  "visible": true,
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "assignedTo",
                    "customLabel": "Assigned To",
                    "labelOrientation": "Left",
                    "kind": "text",
                    "tableDefinition": "",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "taskState",
                    "customLabel": "Task State",
                    "labelOrientation": "Left",
                    "kind": "state-editor",
                    "tableDefinition": "",
                    "visible": true,
                    "editable": true
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
                  "propertyName": "name",
                  "customLabel": "Name",
                  "visible": true,
                  "editable": true,
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
                    "propertyName": "estimatedStart",
                    "customLabel": "Estimated Start",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "estimatedCompletion",
                    "customLabel": "Estimated Completion",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "estimatedHoursEffort",
                    "customLabel": "Estimated Hours Effort",
                    "labelOrientation": "Top",
                    "kind": "number",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "remainingHoursEffort",
                    "customLabel": "Remaining Hours Effort",
                    "labelOrientation": "Top",
                    "kind": "number",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "actualHoursEffort",
                    "customLabel": "Actual Hours Effort",
                    "labelOrientation": "Top",
                    "kind": "number",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "predecessors",
                    "customLabel": "Predecessors",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": true,
                    "tableDefinition": "3b4d68d0-e603-11e9-bf30-55b2f7a3af55"
                  },
                  {
                    "propertyName": "assignedTo",
                    "customLabel": "Assigned To",
                    "labelOrientation": "Left",
                    "kind": "text",
                    "tableDefinition": "",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "taskState",
                    "customLabel": "Task State",
                    "labelOrientation": "Top",
                    "kind": "state-editor",
                    "visible": true,
                    "editable": true
                  }
                ]
              }
            ]
          }
        },
        "defaultFormatKey": {
          "default": "dc8f7b20-5d7c-11ea-9d2a-81904e0f9ce1",
          "document": "89324a90-a7af-11e8-8662-71e48f0160fe",
          "card": "1b91cfb0-1798-11ea-a725-0b882dea506f",
          "board": "1b91cfb0-1798-11ea-a725-0b882dea506f"
        },
        "tableDefinitions": {}
      },
      "UseCase": {
        "id": "view-usecase",
        "name": "UseCase",
        "parentId": "view-item",
        "createdBy": "gmckune",
        "createdOn": 1570033169859,
        "modifiedBy": "gmckune",
        "modifiedOn": 1591742618536,
        "modelName": "UseCase",
        "icon": "fa fa-lemon-o",
        "color": "#000000",
        "viewProperties": {
          "Actors": {
            "displayName": "Actors",
            "inputType": {
              "type": "",
              "options": {}
            },
            "name": "Actors"
          },
          "BasicPath": {
            "displayName": "BasicPath",
            "inputType": {
              "type": "",
              "options": {}
            },
            "name": "BasicPath"
          },
          "AlternativePaths": {
            "displayName": "AlternativePaths",
            "inputType": {
              "type": "",
              "options": {}
            },
            "name": "AlternativePaths"
          }
        },
        "localTypes": {
          "FlowOfEvents": {
            "name": "FlowOfEvents",
            "modelName": "FlowOfEvents",
            "icon": "",
            "color": "#000000",
            "viewProperties": {
              "PathName": {
                "name": "PathName",
                "displayName": "PathName",
                "inputType": {
                  "type": "text",
                  "options": {}
                }
              },
              "PathDescription": {
                "name": "PathDescription",
                "displayName": "PathDescription",
                "inputType": {
                  "type": "text",
                  "options": {}
                }
              },
              "Preconditions": {
                "name": "Preconditions",
                "displayName": "Preconditions",
                "inputType": {
                  "type": "text",
                  "options": {}
                }
              },
              "Postconditions": {
                "name": "Postconditions",
                "displayName": "Postconditions",
                "inputType": {
                  "type": "text",
                  "options": {}
                }
              },
              "Flow": {
                "name": "Flow",
                "displayName": "Flow",
                "inputType": {
                  "type": "",
                  "options": {}
                }
              }
            },
            "formatDefinitions": {
              "e91a8a60-5d7c-11ea-9d2a-81904e0f9ce1": {
                "id": "e91a8a60-5d7c-11ea-9d2a-81904e0f9ce1",
                "name": "Default Format Definition",
                "header": {
                  "kind": "header",
                  "contents": []
                },
                "containers": [
                  {
                    "kind": "list",
                    "contents": [
                      {
                        "propertyName": "PathName",
                        "customLabel": "PathName",
                        "labelOrientation": "Top",
                        "kind": "text",
                        "visible": true,
                        "editable": true
                      },
                      {
                        "propertyName": "PathDescription",
                        "customLabel": "PathDescription",
                        "labelOrientation": "Top",
                        "kind": "text",
                        "visible": true,
                        "editable": true
                      },
                      {
                        "propertyName": "Preconditions",
                        "customLabel": "Preconditions",
                        "labelOrientation": "Top",
                        "kind": "text",
                        "visible": true,
                        "editable": true
                      },
                      {
                        "propertyName": "Flow",
                        "customLabel": "Flow",
                        "labelOrientation": "Top",
                        "kind": "",
                        "visible": true,
                        "editable": true,
                        "tableDefinition": ""
                      },
                      {
                        "propertyName": "Postconditions",
                        "customLabel": "Postconditions",
                        "labelOrientation": "Top",
                        "kind": "text",
                        "visible": true,
                        "editable": true
                      }
                    ]
                  }
                ]
              },
              "e23e9430-aaa1-11ea-b364-ab76a773089f": {
                "id": "e23e9430-aaa1-11ea-b364-ab76a773089f",
                "name": "DocumentFormatDefinition",
                "header": {
                  "kind": "header",
                  "contents": []
                },
                "containers": [
                  {
                    "kind": "list",
                    "contents": [
                      {
                        "propertyName": "PathName",
                        "customLabel": "PathName",
                        "labelOrientation": "Top",
                        "kind": "text",
                        "visible": true,
                        "editable": true
                      },
                      {
                        "propertyName": "PathDescription",
                        "customLabel": "PathDescription",
                        "labelOrientation": "Top",
                        "kind": "text",
                        "tableDefinition": "",
                        "visible": true,
                        "editable": true
                      },
                      {
                        "propertyName": "Preconditions",
                        "customLabel": "Preconditions",
                        "labelOrientation": "Top",
                        "kind": "text",
                        "tableDefinition": "",
                        "visible": true,
                        "editable": true
                      },
                      {
                        "propertyName": "Flow",
                        "customLabel": "Flow",
                        "labelOrientation": "Top",
                        "kind": "",
                        "tableDefinition": "5b7cf180-aa97-11ea-b459-333ae1bfee22",
                        "visible": true,
                        "editable": true
                      },
                      {
                        "propertyName": "Postconditions",
                        "customLabel": "Postconditions",
                        "labelOrientation": "Top",
                        "kind": "text",
                        "tableDefinition": "",
                        "visible": true,
                        "editable": true
                      }
                    ]
                  }
                ]
              }
            },
            "defaultFormatKey": {
              "default": "e91a8a60-5d7c-11ea-9d2a-81904e0f9ce1",
              "document": "e23e9430-aaa1-11ea-b364-ab76a773089f"
            },
            "tableDefinitions": {}
          }
        },
        "formatDefinitions": {
          "e91a8a60-5d7c-11ea-9d2a-81904e0f9ce1": {
            "id": "e91a8a60-5d7c-11ea-9d2a-81904e0f9ce1",
            "name": "Default Format Definition",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "visible": true,
                  "kind": "text",
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "kind",
                    "customLabel": "Kind",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "status",
                    "customLabel": "Status",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "id",
                    "customLabel": "ID",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "tags",
                    "customLabel": "Tags",
                    "labelOrientation": "Top",
                    "kind": "text",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "parentId",
                    "customLabel": "Parent",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "createdBy",
                    "customLabel": "Created By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "createdOn",
                    "customLabel": "Created On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedBy",
                    "customLabel": "Modified By",
                    "labelOrientation": "Top",
                    "kind": "user-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "modifiedOn",
                    "customLabel": "Modified On",
                    "labelOrientation": "Top",
                    "kind": "date",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "loadPending",
                    "customLabel": "loadPending",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "hasValidationError",
                    "customLabel": "hasValidationError",
                    "labelOrientation": "Top",
                    "kind": "boolean",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "$dirtyFields",
                    "customLabel": "$dirtyFields",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "__deletedProperty",
                    "customLabel": "__deletedProperty",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "itemIds",
                    "customLabel": "itemIds",
                    "labelOrientation": "Top",
                    "kind": "string",
                    "visible": false,
                    "editable": false
                  },
                  {
                    "propertyName": "children",
                    "customLabel": "Children",
                    "labelOrientation": "Top",
                    "kind": "proxy-selector",
                    "visible": true,
                    "editable": false
                  },
                  {
                    "propertyName": "approvedBy",
                    "customLabel": "approvedBy",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "text",
                    "editable": true
                  },
                  {
                    "propertyName": "approvedOn",
                    "customLabel": "approvedOn",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "date",
                    "editable": true
                  },
                  {
                    "propertyName": "rationale",
                    "customLabel": "rationale",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "text",
                    "editable": true
                  },
                  {
                    "propertyName": "alternatives",
                    "customLabel": "alternatives",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "costImpact",
                    "customLabel": "costImpact",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "scheduleImpact",
                    "customLabel": "scheduleImpact",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "otherImpacts",
                    "customLabel": "otherImpacts",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "Actors",
                    "customLabel": "Actors",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "BasicPath",
                    "customLabel": "BasicPath",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  },
                  {
                    "propertyName": "AlternativePaths",
                    "customLabel": "AlternativePaths",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "",
                    "editable": true
                  }
                ]
              },
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "decisionState",
                    "customLabel": "decisionState",
                    "labelOrientation": "Top",
                    "visible": true,
                    "kind": "state-editor",
                    "editable": true
                  }
                ]
              }
            ]
          },
          "89324a90-a7af-11e8-8662-71e48f0160fe": {
            "name": "DocumentDefForUC",
            "header": {
              "kind": "header",
              "contents": [
                {
                  "propertyName": "name",
                  "customLabel": "Name",
                  "labelOrientation": "Top",
                  "kind": "text",
                  "visible": true,
                  "editable": true
                }
              ]
            },
            "containers": [
              {
                "kind": "list",
                "contents": [
                  {
                    "propertyName": "description",
                    "customLabel": "Description",
                    "labelOrientation": "Top",
                    "kind": "markdown",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "Actors",
                    "customLabel": "Actors",
                    "labelOrientation": "Top",
                    "kind": "",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "BasicPath",
                    "customLabel": "BasicPath",
                    "labelOrientation": "Top",
                    "kind": "",
                    "formatDefinition": "e91a8a60-5d7c-11ea-9d2a-81904e0f9ce1",
                    "tableDefinition": "",
                    "visible": true,
                    "editable": true
                  },
                  {
                    "propertyName": "AlternativePaths",
                    "customLabel": "AlternativePaths",
                    "labelOrientation": "Top",
                    "kind": "",
                    "formatDefinition": "e91a8a60-5d7c-11ea-9d2a-81904e0f9ce1",
                    "tableDefinition": "",
                    "visible": true,
                    "editable": true
                  }
                ]
              }
            ],
            "id": "89324a90-a7af-11e8-8662-71e48f0160fe"
          }
        },
        "defaultFormatKey": {
          "default": "e91a8a60-5d7c-11ea-9d2a-81904e0f9ce1",
          "document": "89324a90-a7af-11e8-8662-71e48f0160fe"
        },
        "tableDefinitions": {
          "2d055090-f9e9-11e9-b7dd-656a0313eaea": {
            "id": "2d055090-f9e9-11e9-b7dd-656a0313eaea",
            "name": "Use Case Table",
            "columns": [
              "BasicPath",
              "AlternativePaths"
            ],
            "expandedFormat": {
              "column1": [],
              "column2": [],
              "column3": [],
              "column4": []
            }
          }
        }
      }
    }
  }
}
