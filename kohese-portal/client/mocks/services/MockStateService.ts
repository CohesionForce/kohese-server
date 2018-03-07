import { ItemProxy } from '../../../common/src/item-proxy';

export class MockStateService {
  public constructor() {
  }
  
  public getTransitionCandidates(proxy: ItemProxy): any {
    return {
      actionState: [{
          source: 'Proposed',
          target: 'Assigned',
          guard: {},
          requires: [ 'assignment:Assignee' ],
        }],
      decisionState: [{
          source: 'InReview',
          target: 'Approved',
          guard: {},
          requires: ''
        }, {
          source: 'InReview',
          target: 'Deferred',
          guard: {},
          requires: []
        }, {
          source: 'InReview',
          target: 'Disapproved',
          guard: {}
        }]
    };
  }
}