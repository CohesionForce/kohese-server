import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class NotificationService {
  private notificationDetails: Array<string> = [];
  private Notifications: BehaviorSubject<any> = new BehaviorSubject({
    totalNotifications: 0,
    message: this.notificationDetails
  });

  public constructor() {
  }

  public getNotifications(): BehaviorSubject<any> {
    return this.Notifications;
  }

  public addNotifications(notificationMessage: string) {
    this.notificationDetails.push(notificationMessage);
    this.Notifications.next({
      totalNotifications: this.notificationDetails.length,
      message: this.notificationDetails
    });
  }

  public deleteNotification(notificationMessage: string) {
    let index: number = this.notificationDetails.indexOf(notificationMessage);
    this.notificationDetails.splice(index, 1);
    this.Notifications.next({
      totalNotifications: this.notificationDetails.length,
      message: this.notificationDetails
    });
  }
}
