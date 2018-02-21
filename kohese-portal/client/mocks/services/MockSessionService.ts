import { MockUserData } from '../data/MockUser';
import * as ItemProxy from '../../../common/models/item-proxy';

export class MockSessionService {
  getUsers() {
    return [new ItemProxy('KoheseUser', MockUserData)]
  }
}