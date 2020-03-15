import { MockUserData } from '../data/MockUser';

export class MockSessionService {
  get user() {
    return MockUserData();
  }
  
  get users() {
    return [MockUserData()];
  }
  
  constructor() {
  }

  getSessions() {
    return {123: {}}
  }
}
