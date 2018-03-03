import { MockUserData } from '../data/MockUser';
import * as ItemProxy from '../../../common/src/item-proxy';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export class MockSessionService {
  userSubject;

  constructor() {
    let user = new ItemProxy('KoheseUser', MockUserData());
    this.userSubject = new BehaviorSubject(user);
  }
  getUsers() {
    return [new ItemProxy('KoheseUser', MockUserData())]
  }

  getSessionUser() {
    return this.userSubject;
  }

  getSessions() {
    return {123: {}}
  }
}