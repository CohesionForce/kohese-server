import { BehaviorSubject } from 'rxjs';
import { ItemProxy } from '../../../common/src/item-proxy';

import { MockUserData } from '../data/MockUser';

export class MockCurrentUserService {
  getCurrentUserSubject () {
    let proxy: ItemProxy = new ItemProxy('KoheseUser', MockUserData());
    return new BehaviorSubject<any>(proxy.item);
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
