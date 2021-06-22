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


import { Subject } from 'rxjs';
import { LoggingEventRecord } from './k-logger';

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

  private static singleton: KLogger;

  componentRegistry: { [nameString: string]: ComponentLogRecord } = {};
  loggingEventRegistry: { [nameString: string]: LoggingEventRecord } = {};
  loggingCategoryRegistry: { [nameString: string]: LoggingCategoryRecord } = {};

  loggingEventRegisteredSubject: Subject <LoggingEventRecord> = new Subject<LoggingEventRecord>()

  private showAllErrors: boolean = true;

  constructor(logRegistry? : any) {
    if (!KLogger.singleton) {
      KLogger.singleton = this;
      if (logRegistry) {
        for (let logEvent of logRegistry) {
          this.loggingEventRegistry[logEvent.id] = logEvent;
        }
      } else {
        console.log('Initializing Log Registry');
      }
    }
    return KLogger.singleton;
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
    let loggingEventRecord: LoggingEventRecord = this.loggingEventRegistry[
      '[' + eventName + ']'];
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
    this.loggingEventRegistry[loggingEventRecord.id] = loggingEventRecord;
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
    if (this.loggingEventRegistry[eventId].active) {
      console.log(eventId);
      if (infoObject) {
        console.log(infoObject);
        console.log('//////')
      }
    } else {
      // Log Not Active
    }
  }

  getLogRegisteredSubject() : Subject<LoggingEventRecord> {
    return this.loggingEventRegisteredSubject;
  }


  // getLogEvents() {
  //   return this.loggingEventSubject;
  // }
}
