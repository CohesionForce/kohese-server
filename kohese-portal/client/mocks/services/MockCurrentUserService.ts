import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as ItemProxy from '../../../common/src/item-proxy';

import { MockUserData } from '../data/MockUser';

export class MockCurrentUserService {
  getCurrentUserSubject () {
    return new BehaviorSubject<any>(new ItemProxy('KoheseUser', MockUserData())); 
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