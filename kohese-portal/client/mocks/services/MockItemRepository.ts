import { BehaviorSubject} from 'rxjs/BehaviorSubject';

export class MockItemRepository {
  getRepoStatusSubject () {
    return new BehaviorSubject<any>({connected : true})
  }

  getRootProxy () {
    return {};
  }

  getProxyFor () {
    return {};
  }
}