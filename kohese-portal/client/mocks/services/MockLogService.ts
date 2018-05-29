import { LoggingEventRecord } from '../../../common/src/k-logger';

export class MockLogService {
  public getLogEvents(): Array<LoggingEventRecord> {
    return [];
  }
  
  public updateLogRegistry(registry: Array<LoggingEventRecord>): void {
  }
}