import { BehaviorSubject } from 'rxjs';

export class MockNotificationService {
  public constructor() {
  }
  
  public getNotifications(): BehaviorSubject<any> {
    return new BehaviorSubject<any>({
      totalNotifications: 0,
      message: []
    });
  }
}
