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
    "description" : "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; In ac dui quis mi consectetuer lacinia. Nam pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Sed aliquam ultrices mauris. Integer ante arcu, accumsan a, consectetuer eget, posuere ut, mauris. Praesent adipiscing. Phasellus ullamcorper ipsum rutrum nunc. Nunc nonummy metus. Vestibulum volutpat pretium libero. Cras id dui. Aenean ut eros et nisl sagittis vestibulum. Nullam nulla eros, ultricies sit amet, nonummy id, imperdiet feugiat, pede. Sed lectus. Donec mollis hendrerit risus. Phasellus nec sem in justo pellentesque facilisis. Etiam imperdiet imperdiet orci. Nunc nec neque. Phasellus leo dolor, tempus non, auctor et, hendrerit quis, nisi. Curabitur ligula sapien, tincidunt non, euismod vitae, posuere imperdiet, leo. Maecenas malesuada. Praesent congue erat at massa..",
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