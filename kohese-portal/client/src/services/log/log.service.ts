import { Subject } from 'rxjs/Subject';
import { Injectable } from "@angular/core";
import { KLogger, LoggingEventRecord } from "../../../../common/src/k-logger";
import { Subscription, BehaviorSubject } from "rxjs";

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
