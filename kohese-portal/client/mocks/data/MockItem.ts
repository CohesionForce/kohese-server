export function MockItem () {
  return {
    "id": "test-uuid",
    "name": "Test item",
    "description": "test description",
    "createdBy": "admin",
    "createdOn": 1510596684590,
    "modifiedBy": "admin",
    "modifiedOn": 1510596684590,
    "itemIds": [],
    actionState: 'Proposed',
    decisionState: 'InReview',
    predecessors: []
  };
}

export function MockRoot () { 
  return {
  "id": "",
  "name": "Test item",
  "createdBy": "admin",
  "createdOn": 1510596684590,
  "modifiedBy": "admin",
  "modifiedOn": 1510596684590,
  "itemIds": []
  }
}

export function MockDocument () {
  return {
    "id": "",
    "name": "Test item",
    "description" : "This is the MockDocument text. Additional text can be added if needed.",
    "parentId": "44f38b70-bf50-11e7-b267-97e34e682c16",
    "createdBy": "admin",
    "createdOn": 1510596684590,
    "modifiedBy": "admin",
    "modifiedOn": 1510596684590,
    "itemIds": []
    }
}

export function MockAction () {
  return {
    "actionState": "Verified",
    predecessors: [],
    "assignedTo": "test-user",
    "estimatedStart": 1510596684590,
    "estimatedCompletion": 1589789786000,
    "estimatedHoursEffort": 3,
    "actualStart": 1510596684590,
    "actualCompletion": 1589789876000,
    "decisionState": "Approved",
    "approvedBy": "test-approver",
    "id": "3fc4e570-6c75-11e5-95f3-e91e0a47fde1",
    "name": "test action",
    "tags": "",
    "description": "test-description",
    "parentId": "eadf1e70-66db-11e5-89f1-33a86f9e302a",
    "createdBy": "test-user",
    "createdOn": 1444168654148,
    "modifiedBy": "test-user",
    "modifiedOn": 1444767003567,
    "itemIds": []
  }
}