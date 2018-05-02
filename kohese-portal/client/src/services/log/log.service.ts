import { Injectable } from "@angular/core";
import { KLogger, LogCategories } from "../../../../common/src/k-logger";

@Injectable()
export class LogService {
  logger: KLogger;
  categories: any = LogCategories;

  constructor() {
    this.logger = new KLogger()
    LogCategories

  }

  log(message: any, category: LogCategories) {
    this.logger.log(message, category)
  }

  info(message: any, category: LogCategories) {
    this.logger.info(message, category)
  }

  error(message: any, category : LogCategories) {
    this.logger.error(message, category);
  }


}