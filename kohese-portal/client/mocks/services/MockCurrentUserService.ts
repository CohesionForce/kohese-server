import { BehaviorSubject } from 'rxjs';

import { TreeConfiguration } from '../../../common/src/tree-configuration';

export class MockCurrentUserService {
  getCurrentUserSubject () {
    return new BehaviorSubject<any>(TreeConfiguration.getWorkingTree().
      getProxyFor('AdminKoheseUser'));
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
