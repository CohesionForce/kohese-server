import { Subject } from 'rxjs/Subject';
import { LoggingEventRecord } from './k-logger';
import * as Bunyan from "bunyan";
import { BehaviorSubject } from "rxjs";
import { BREAKPOINTS } from "@angular/flex-layout";

// TODO: does this need to be more configurable?
export enum LoggingLevel {
  INFO,
  WARN,
  ERROR
}

export interface ComponentLogDefinition {
  name: string;
  description: string;
}

export interface LoggingEventDefinition {
  name: string; // A simple message that can be provided
  description: string;
  severity?: LoggingLevel; // This concept can be integrated later or else it could be handled by LoggingCategory
}

export interface LoggingCategoryDefinition {
  name: string;
  description: string;
}

interface ComponentLogRecord {
  id: string;
  definition: ComponentLogDefinition;
  loggingEventDefinitions: {}
  automaticallyCreated?: boolean; // Needs to be added to the central repository
}

export interface LoggingEventRecord {
  id: string;
  definition: ComponentLogDefinition;
  automaticallyCreated?: boolean; // Needs to be added to the central repository
  active : boolean;
}

interface LoggingCategoryRecord {
  id: string;
  definition: ComponentLogDefinition;
  loggingEventDefinitions: { [loggingEventId: string]: LoggingEventRecord };
  automaticallyCreated?: boolean; // Needs to be added to the central repository
}

export class KLogger {
  public bunyan: any;

  private static singleton: KLogger;

  componentRegistry: { [nameString: string]: ComponentLogRecord } = {};
  loggingEventRegistry: { [nameString: string]: LoggingEventRecord } = {};
  loggingCategoryRegistry: { [nameString: string]: LoggingCategoryRecord } = {};

  loggingEventRegisteredSubject: Subject <LoggingEventRecord> = new Subject<LoggingEventRecord>()
  logMap : any = {};

  private showAllErrors: boolean = true;

  constructor(logRegistry? : any) {
    if (!KLogger.singleton) {
      KLogger.singleton = this;
      if (logRegistry) {
        for (let logEvent of logRegistry) {
          this.logMap[logEvent.id] = logEvent;
        }
      } else {
        console.log('Initializing Log Registry');
      }
      this.createLogger();
    }
    return KLogger.singleton;
  }

  createLogger() {
    this.bunyan = Bunyan.createLogger({
      name: 'Default logger',
    })
  }

  getComponentId(componentName: string): string {
    let componentId = undefined;
    let componentRecord: ComponentLogRecord = this.componentRegistry[componentName];

    if (!componentRecord) {
      // Component record was not found, create one and flag for registration
      componentRecord = {
        id: '<' + componentName + '>',
        definition: {
          name: componentName,
          description: "Component record for: " + componentName
        },
        loggingEventDefinitions: {},
        automaticallyCreated: true
      }
      this.componentRegistry[componentName] = componentRecord;
    }

    return componentRecord.id;
  }

  getEventId(componentId: string, eventName: string): string {
    let loggingEventRecord: LoggingEventRecord = this.loggingEventRegistry[eventName];
    let id;
    if (loggingEventRecord) {
      id = loggingEventRecord.id;
    }
    return id;
   }

  generateEventRecord(componentId: string, eventName: string): LoggingEventRecord {
    let loggingEventRecord : LoggingEventRecord;

    loggingEventRecord = {
      id: '[' + eventName + ']',
      definition: {
        name: eventName,
        description: "Event Logging record for: " + componentId + ' - ' + eventName
      },
      // loggingEventDefinitions : {},
      automaticallyCreated: true,
      active : false
    }
    this.loggingEventRegistry[eventName] = loggingEventRecord;
    this.loggingEventRegisteredSubject.next(loggingEventRecord)

    return loggingEventRecord;
  }

  getCategoryId(categoryName: string): string {
    return "DONT_DO_THIS_YET";
  }

  associateCategoryToEvent(categoryId, eventId): never {
    throw "dont_do_this_yet";
  }

  log(eventId: string, infoObject?: any) {
    if (this.logMap[eventId]) {
      console.log(eventId);
      if (infoObject) {
        console.log(infoObject);
        console.log('//////')
      }
    } else {
      console.log('log fail');
    }
  }

  getLogRegisteredSubject() : Subject<LoggingEventRecord> {
    return this.loggingEventRegisteredSubject;
  }


  // getLogEvents() {
  //   return this.loggingEventSubject;
  // }
}
