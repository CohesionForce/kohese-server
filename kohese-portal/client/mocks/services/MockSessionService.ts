import { MockUserData } from '../data/MockUser';
import * as ItemProxy from '../../../common/models/item-proxy';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export class MockSessionService {
  getUsers() {
    return [new ItemProxy('KoheseUser', MockUserData)]
  }

  getSessionUser() {
    return new BehaviorSubject<ItemProxy>(new ItemProxy('KoheseUser', MockUserData));
  }
}