/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// Angular
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Other External Dependencies

// Kohese

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
