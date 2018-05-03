import { Injectable } from "@angular/core";
import { KLogger } from "../../../../common/src/k-logger";

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

  constructor() {
    this.logger = new KLogger();
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
}