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
  logEvents : {[nameString:string] : LoggingEventRecord}
  logEventsSub : Subscription
  subscribedLogEvents : any;
  subscribedLogEventsSubject : BehaviorSubject<any>;

  constructor() {
    let subscriptionString = localStorage.getItem('subscribedLogEvents');
    if (subscriptionString) {
      this.subscribedLogEvents = JSON.parse(subscriptionString);
    }
    this.subscribedLogEventsSubject = new BehaviorSubject<any>(this.subscribedLogEvents);

    this.logger = new KLogger(this.subscribedLogEvents);
    this.logEventsSub = this.logger.getLogEvents().subscribe((newLogEvents)=>{
      this.logEvents = newLogEvents;
      console.log(this.logEvents);
    })
  }

  getComponentId(componentName: string): string {
    return this.logger.getComponentId(componentName);
  }

  getEventId(componentId: string, eventName: string): string {
    return this.logger.getEventId(componentId, eventName);
  }

  log(eventId : string, infoObject?: any) {
    this.logger.log(eventId, infoObject)
  }

  info(logInfo : LogInformation, infoObject?: any) {
    this.logger.info(logInfo, infoObject)
  }

  error(logInfo : LogInformation, infoObject? : any) {
    this.logger.error(logInfo, infoObject);
  }

  getLogEvents() {
    return this.logEvents;
  }

  saveLogEventsSubscription (selectedEvents : any ) {
    localStorage.setItem('subscribedLogEvents', JSON.stringify(selectedEvents));
    this.subscribedLogEvents = selectedEvents;
    this.subscribedLogEventsSubject.next(selectedEvents);
  }

  getLogEventsSubscription () {
    return this.subscribedLogEventsSubject;
  }
}
