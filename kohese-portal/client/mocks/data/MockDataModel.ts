export function MockDataModel () { 
  return {
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
    },
    "actionState": {
      "type": "StateMachine",
      "required": true,
      "default": "Proposed",
      "properties": {
        "state":{
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
            "requires": [ "assignment:Assignee" ]
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
        "state":{
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
            "requires": [ "assignment:Analyzer" ]
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
}

export function ItemSubclass() {
  return {
    "name": "ItemSubclass",
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
    "methods": []
  };
};
