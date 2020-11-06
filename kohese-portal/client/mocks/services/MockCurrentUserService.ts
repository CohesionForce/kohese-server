import { BehaviorSubject } from 'rxjs';

import { TreeConfiguration } from '../../../common/src/tree-configuration';

export class MockCurrentUserService {
  getCurrentUserSubject () {
    return new BehaviorSubject<any>({username: 'admin'});
  }

  setCurrentUser (updatedUser) {
    return new BehaviorSubject<any>(updatedUser);
  }

  getCredentialSubscription () {
    return new BehaviorSubject({});
  }

  login () {

  }

  logout () {

  }
}
