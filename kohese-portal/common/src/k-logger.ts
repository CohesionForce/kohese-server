import * as Bunyan from "bunyan";

export enum LogCategories {
  "ITEM_CREATE_UPDATES", //  Notification of Item Creation
  "ITEM_UPDATES", // Notifications of Item upserts
  "BULK_UPDATES", // Notification of large loads of items
  "ITEM_DELETE_UPDATES", // Notification of Item Deletion
  "ALL_PROXY_CHANGES", // Log of all proxy changes that come from change subject
  "ITEM_REPOSITORY_INIT", // Initialization Logs for the Item Repository
  "ITEM_REPOSITORY_UPDATES", // Updates to the state of the item repository
  "ITEM_PROXY_INIT", // Initialization Logs for the Item Proxy Model
  "VERSION_CONTROL_UPDATES", // Updates to the git status of items
  "SOCKET_INFO", // Information about the websocket connection,
  "PERFORMANCE", // Information about app performance,
  "TREE_CONFIG_UPDATES", // Info about the client tree configuration,
  "DOCUMENT_GENERATION", // Info about document generation requests
  "ANALYSIS_INFO" // Info about document analysis
}

export class KLogger {
  public logger: any;
  private activeLogs: Map<LogCategories, boolean> = new Map<LogCategories, boolean>();
  private showAllErrors: boolean = true;

  constructor(options?: Map<LogCategories, boolean>) {
    if (!options) {
      options = new Map<LogCategories, boolean>();
      options.set(LogCategories.ITEM_CREATE_UPDATES, true),
      options.set(LogCategories.ITEM_UPDATES, true);
      options.set(LogCategories.BULK_UPDATES, true);
      options.set(LogCategories.ITEM_DELETE_UPDATES, true)
      options.set(LogCategories.ALL_PROXY_CHANGES, false);
      options.set(LogCategories.ITEM_REPOSITORY_INIT, true)
      options.set(LogCategories.ITEM_REPOSITORY_UPDATES, true);
      options.set(LogCategories.ITEM_PROXY_INIT, true);
      options.set(LogCategories.VERSION_CONTROL_UPDATES, false);
      options.set(LogCategories.SOCKET_INFO, false);
      options.set(LogCategories.PERFORMANCE, true);
      options.set(LogCategories.TREE_CONFIG_UPDATES, true);
      options.set(LogCategories.DOCUMENT_GENERATION, false);
      options.set(LogCategories.ANALYSIS_INFO, false);

    }
    this.createLogger(options);
  }

  createLogger(options) {
    this.logger = Bunyan.createLogger({
      name: 'Default logger',
    })
    this.activeLogs = options;
  }

  log(message: any, category: LogCategories) {
    if (this.activeLogs.get(category)) {
      console.log(message);
    } 
  }

  info(message: any, category: LogCategories) {
    if (this.activeLogs.get(category)) {
      this.logger.info(message);
    } 
  }

  error(message: any, category: LogCategories) {
    if (this.showAllErrors) {
      console.error(message)
    } else if (this.activeLogs.get(category)) {
      console.error(message);
    }
  }

  setLogCategories(activeLogs: Map<LogCategories, boolean>) {
    this.activeLogs = activeLogs
  }

  getLogCategories(): Map<LogCategories, boolean> {
    return this.activeLogs;
  }
}