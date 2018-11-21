import { BehaviorSubject } from 'rxjs';
import { ItemProxy } from '../../../common/src/item-proxy';
import { KoheseModel } from '../../../common/src/KoheseModel';
import { MockItem } from '../data/MockItem';
import { MockDataModel } from '../data/MockDataModel';

export class MockCurrentUserService {
  getCurrentUserSubject () {
    let modelItem: any = MockDataModel();
    modelItem.id = 'KoheseUser';
    modelItem.name = 'KoheseUser';
    new KoheseModel(modelItem);
    KoheseModel.modelDefinitionLoadingComplete();
    let proxy: ItemProxy = new ItemProxy('KoheseUser', MockItem());
    
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
