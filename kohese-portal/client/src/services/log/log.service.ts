/*
 * Copyright (c) 2021 CohesionForce inc. | www.CohesionForce.com | info@CohesionForce.com
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


import { Subject ,  Subscription, BehaviorSubject } from 'rxjs';
import { Injectable } from "@angular/core";
import { KLogger, LoggingEventRecord } from "../../../../common/src/k-logger";

export interface LogCategory {
  description : string,
  id : string
}

export interface LogInformation {
  component : string,
  category : LogCategory,
  id : string
  message : string
}

@Injectable()
export class LogService {
  logger: KLogger;
  componentMap : {};
  logRegistry : Array<LoggingEventRecord>;
  logRegistrySubject : BehaviorSubject<any>;
  logRegisteredSubscription : Subscription

  constructor() {
    let logRegistryJSON = localStorage.getItem('logRegistry');
    if (logRegistryJSON) {
      this.logRegistry = JSON.parse(logRegistryJSON);
    } else {
      this.logRegistry = [];
    }
    this.logRegistrySubject = new BehaviorSubject<any>(this.logRegistry);

    this.logger = new KLogger(this.logRegistry);

    this.logRegisteredSubscription = this.logger.getLogRegisteredSubject().subscribe((newLogEvent : LoggingEventRecord)=>{
      this.logRegistry.push(newLogEvent);
      this.updateLogRegistry(this.logRegistry);
    })
  }

  getComponentId(componentName: string): string {
    return this.logger.getComponentId(componentName);
  }

  getEventId(componentId: string, eventName: string): string {
    let newEventRecord : LoggingEventRecord;
    let eventId = this.logger.getEventId(componentId, eventName);
    if (!eventId) {
      newEventRecord = this.logger.generateEventRecord(componentId, eventName);
      eventId = newEventRecord.id
    }
    return eventId;
  }

  log(eventId : string, infoObject?: any) {
    this.logger.log(eventId, infoObject)
  }

  getLogEvents() {
    return this.logRegistry;
  }

  // Should only really be called from the dev tools for now
  updateLogRegistry (logRegistry : Array<LoggingEventRecord> ) {
    localStorage.setItem('logRegistry', JSON.stringify(logRegistry));
    this.logRegistry = logRegistry;
    this.logRegistrySubject.next(logRegistry);
  }
}
