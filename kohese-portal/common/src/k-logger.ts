import * as Bunyan from "bunyan";

// TODO: does this need to be more configurable?
export enum LoggingLevel {
  INFO,
  WARN,
  ERROR
}

export interface ComponentLogDefinition {
  name : string;
  description : string;
}

export interface LoggingEventDefinition {
  name : string; // A simple message that can be provided
  description : string;
  severity? : LoggingLevel; // This concept can be integrated later or else it could be handled by LoggingCategory
}

export interface LoggingCategoryDefinition {
  name : string;
  description : string;
}

interface ComponentLogRecord {
  id : string;
  definition : ComponentLogDefinition;
  loggingEventDefinitions : {}
  automaticallyCreated? : boolean; // Needs to be added to the central repository
}

interface LoggingEventRecord {
  id : string;
  definition : ComponentLogDefinition;
//  componentLogRecord : ComponentLogRecord;
  enabled : boolean;
  automaticallyCreated? : boolean; // Needs to be added to the central repository
}

interface LoggingCategoryRecord {
  id : string;
  definition : ComponentLogDefinition;
  loggingEventDefinitions : {[loggingEventId : string] : LoggingEventRecord};
  automaticallyCreated? : boolean; // Needs to be added to the central repository
}

export class KLogger {
  public logger: any;

  private static singleton : KLogger;

  componentRegistry : { [nameString:string] : ComponentLogRecord };
  loggingEventRegistry : { [nameString:string] : LoggingEventRecord };
  loggingCategoryRegistry : { [nameString:string] : LoggingCategoryRecord };

  private showAllErrors: boolean = true;

  constructor() {
    if (!KLogger.singleton){
      KLogger.singleton = this;
      this.createLogger();
    }
    return KLogger.singleton;
  }

  createLogger() {
    this.logger = Bunyan.createLogger({
      name: 'Default logger',
    })
  }

  getComponentId(componentName: string): string {
    let componentId = undefined;
    let componentRecord : ComponentLogRecord = this.componentRegistry[componentName];

    if (!componentRecord) {
      // Component record was not found, create one and flag for registration
      componentRecord = {
        id : '<'+ componentName +'>',
        definition : {
          name:componentName,
          description: "Component record for: " + componentName 
        },
        loggingEventDefinitions : {},
        automaticallyCreated : true      
      }
      this.componentRegistry[componentName] = componentRecord;
    }

    return componentRecord.id;
  }

  getEventId(componentId: string, eventName: string): string {
    let eventId = undefined;
    let loggingEventRecord : LoggingEventRecord = this.loggingEventRegistry[eventName];

    if (!loggingEventRecord) {
      // LoggingEvent record was not found, create one and flag for registration

      loggingEventRecord = {
        id : '['+ eventName +']',
        definition : {
          name: eventName,
          description: "Event Logging record for: " + componentId + ' - ' + eventName
        },
        // loggingEventDefinitions : {},
        enabled : true,  // Will need to be looked up in the future
        automaticallyCreated : true      
      }
      this.loggingEventRegistry[eventName] = loggingEventRecord;
    }

    return loggingEventRecord.id;
  }

  getCategoryId(categoryName: string) : string {
    return "DONT_DO_THIS_YET";
  }

  associateCategoryToEvent(categoryId, eventId) : never {
    throw "dont_do_this_yet";
  }

  log(eventId : string, infoObject?: any) {
    console.log(eventId);
    if (infoObject) {
      console.log(infoObject);
      console.log('//////')
    }
  }

  info(message: any, infoObject?: any) {
    this.logger.info(message);
    if (infoObject) {
      console.log(infoObject);
      console.log('//////')
    }
  }

  error(message: any, infoObject?: any) {
    console.error(message)
    if (infoObject) {
      console.log(infoObject);
      console.log('//////')
    }
  }

  setLogCategories() {

  }

  getLogCategories() {

  }
}