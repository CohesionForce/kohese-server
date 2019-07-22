import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class NotificationService {
  private notificationDetails: Array<string>;
  Notifications: BehaviorSubject<any>;
  private numberOfNotifications: number;

  constructor() {
    this.numberOfNotifications = 0;
    this.notificationDetails = [];
    this.Notifications = new BehaviorSubject({
      totalNotifications: this.numberOfNotifications,
      message: this.notificationDetails
    });
  }

  getNotifications (): BehaviorSubject<any> {
    return this.Notifications;
  }

  addNotifications (notificationMessage: string) {
    this.notificationDetails.push(notificationMessage);
    this.Notifications.next({
      totalNotifications: this.notificationDetails.length,
      message: this.notificationDetails
    });
  }

  deleteNotification (notificationMessage: string) {
    let index = this.notificationDetails.indexOf(notificationMessage);
    this.notificationDetails.splice(index, 1);
    this.Notifications.next({
      totalNotifications: this.notificationDetails.length,
      message: this.notificationDetails
    });
  }
}
