
var ItemProxy = require('./item-proxy.js');

var internalStates = [ 
  { id: 'State',
    name: 'State',
    description: 'State Category',
    parentId: '',
    itemIds: [] },
  { id: 'State:ActionState',
    name: 'Action State',
    description: 'Action State Category',
    parentId: 'State',
    itemIds: 
     [ 'State:ActionState:Proposed',
       'State:ActionState:Assigned',
       'State:ActionState:PendingReassign',
       'State:ActionState:PendingRedispostion',
       'State:ActionState:InVerification',
       'State:ActionState:Verified',
       'State:ActionState:Closed' ] },
  { id: 'State:ActionState:Proposed',
    name: 'Proposed',
    description: 'An action that is Proposed.',
    parentId: 'State:ActionState',
    itemIds: [] },
  { id: 'State:ActionState:Assigned',
    name: 'Assigned',
    description: 'An action that is Assigned.',
    parentId: 'State:ActionState',
    itemIds: 
     [ 'State:ActionState:Assigned:Accepted',
       'State:ActionState:Assigned:InWork' ] },
  { id: 'State:ActionState:Assigned:Accepted',
    name: 'Accepted',
    description: 'An action that is Accepted.',
    parentId: 'State:ActionState:Assigned',
    itemIds: [] },
  { id: 'State:ActionState:Assigned:InWork',
    name: 'In Work',
    description: 'An action that is in work.',
    parentId: 'State:ActionState:Assigned',
    itemIds: [] },
  { id: 'State:ActionState:PendingReassign',
    name: 'Pending Reassign',
    description: 'An action that is Pending Reassign.',
    parentId: 'State:ActionState',
    itemIds: [] },
  { id: 'State:ActionState:PendingRedispostion',
    name: 'Pending Redispostion',
    description: 'An action that is Pending Redisposition.',
    parentId: 'State:ActionState',
    itemIds: [] },
  { id: 'State:ActionState:InVerification',
    name: 'In Verification',
    description: 'An action that is In Verification.',
    parentId: 'State:ActionState',
    itemIds: [] },
  { id: 'State:ActionState:Verified',
    name: 'Verified',
    description: 'An action that is Verified.',
    parentId: 'State:ActionState',
    itemIds: [] },
  { id: 'State:ActionState:Closed',
    name: 'Closed',
    description: 'An action that is Closed.',
    parentId: 'State:ActionState',
    itemIds: [] },
  { id: 'State:DecisionState',
    name: 'Decision State',
    description: 'Decision State Category',
    parentId: 'State',
    itemIds: 
     [ 'State:DecisionState:Proposed',
       'State:DecisionState:InAnalysis',
       'State:DecisionState:InReview',
       'State:DecisionState:Approved',
       'State:DecisionState:Deferred',
       'State:DecisionState:Disapproved',
       'State:DecisionState:InAppeal' ] },
  { id: 'State:DecisionState:Proposed',
    name: 'Proposed',
    description: 'A decision that has been proposed.',
    parentId: 'State:DecisionState',
    itemIds: [] },
  { id: 'State:DecisionState:InAnalysis',
    name: 'In Analysis',
    description: 'A decision that is In Analysis.',
    parentId: 'State:DecisionState',
    itemIds: [] },
  { id: 'State:DecisionState:InReview',
    name: 'In Review',
    description: 'A decision that is In Review.',
    parentId: 'State:DecisionState',
    itemIds: [] },
  { id: 'State:DecisionState:Approved',
    name: 'Approved',
    description: 'A decision that is Approved.',
    parentId: 'State:DecisionState',
    itemIds: [] },
  { id: 'State:DecisionState:Approved:Published',
    name: 'Published',
    description: 'A decision that is Published.',
    parentId: 'State:DecisionState:Approved',
    itemIds: [] },
  { id: 'State:DecisionState:Deferred',
    name: 'Deferred',
    description: 'A decision that is Deferred.',
    parentId: 'State:DecisionState',
    itemIds: [] },
  { id: 'State:DecisionState:Disapproved',
    name: 'Disapproved',
    description: 'A decision that is Disapproved.',
    parentId: 'State:DecisionState',
    itemIds: [] },
  { id: 'State:DecisionState:InAppeal',
    name: 'In Appeal',
    description: 'A decision that is In Appeal.',
    parentId: 'State:DecisionState',
    itemIds: [] },
  { id: 'State:IssueState',
    name: 'Issue State',
    description: 'Issue State Category',
    parentId: 'State',
    itemIds: 
     [ 'State:IssueState:Observed',
       'State:IssueState:InAnalysis',
       'State:IssueState:NoAction',
       'State:IssueState:Duplicate',
       'State:IssueState:RequiresAction',
       'State:IssueState:Resolved' ] },
  { id: 'State:IssueState:Observed',
    name: 'Observed',
    description: 'The issue has been Observed.',
    parentId: 'State:IssueState',
    itemIds: [] },
  { id: 'State:IssueState:InAnalysis',
    name: 'In Analysis',
    description: 'The issue is In Analysis.',
    parentId: 'State:IssueState',
    itemIds: [] },
  { id: 'State:IssueState:NoAction',
    name: 'No Action',
    description: 'The issue requires No Action.',
    parentId: 'State:IssueState',
    itemIds: [] },
  { id: 'State:IssueState:Duplicate',
    name: 'Duplicate',
    description: 'The issue is a Duplicate.',
    parentId: 'State:IssueState',
    itemIds: [] },
  { id: 'State:IssueState:RequiresAction',
    name: 'Requires Action',
    description: 'The issue Requires Action.',
    parentId: 'State:IssueState',
    itemIds: [] },
  { id: 'State:IssueState:Resolved',
    name: 'Resolved',
    description: 'The issue is Resolved.',
    parentId: 'State:IssueState',
    itemIds: [] },
  { id: 'State:TaskState',
    name: 'Task State',
    description: 'Task State Category',
    parentId: 'State',
    itemIds: 
     [ 'State:TaskState:Proposed',
       'State:TaskState:Assigned',
       'State:TaskState:PendingReassign',
       'State:TaskState:Completed' ] },
  { id: 'State:TaskState:Proposed',
    name: 'Proposed',
    description: 'A task that is Proposed.',
    parentId: 'State:TaskState',
    itemIds: [] },
  { id: 'State:TaskState:Assigned',
    name: 'Assigned',
    description: 'A task that is Assigned.',
    parentId: 'State:TaskState',
    itemIds: 
     [ 'State:TaskState:Assigned:Accepted',
       'State:TaskState:Assigned:InWork' ] },
  { id: 'State:TaskState:Assigned:Accepted',
    name: 'Accepted',
    description: 'A task that is Accepted.',
    parentId: 'State:TaskState:Assigned',
    itemIds: [] },
  { id: 'State:TaskState:Assigned:InWork',
    name: 'In Work',
    description: 'A task that is In Work.',
    parentId: 'State:TaskState:Assigned',
    itemIds: [] },
  { id: 'State:TaskState:PendingReassign',
    name: 'Pending Reassign',
    description: 'A task that is Pending Reassign.',
    parentId: 'State:TaskState',
    itemIds: [] },
  { id: 'State:TaskState:Completed',
    name: 'Completed',
    description: 'A task that is Completed.',
    parentId: 'State:TaskState',
    itemIds: [] } ];

for (var idx in internalStates) {
  var item = internalStates[idx];
  var proxy = new ItemProxy('Internal-State', item);
}
