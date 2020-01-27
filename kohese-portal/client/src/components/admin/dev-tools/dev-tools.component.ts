import { LoggingEventRecord } from './../../../../../common/src/k-logger';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { LogService } from '../../../services/log/log.service';

@Component({
  selector: 'app-dev-tools',
  templateUrl: './dev-tools.component.html',
  styleUrls: ['./dev-tools.component.scss']
})
export class DevToolsComponent implements OnInit {
  logRegistry : Array<LoggingEventRecord>;

  constructor(private logService: LogService) { }

  ngOnInit() {
    this.logRegistry = this.logService.getLogEvents();

    // Eventually add some subscriptions that will validate the save went through or listen for new log registries
  }

  saveLogSelections() {
    this.logService.updateLogRegistry(this.logRegistry);
  }
  
  public areAllConsoleMessagesSelected(): boolean {
    for (let j: number = 0; j < this.logRegistry.length; j++) {
      if (!this.logRegistry[j].active) {
        return false;
      }
    }
    
    return true;
  }
  
  public toggleAllConsoleMessagesSelected(select: boolean): void {
    for (let j: number = 0; j < this.logRegistry.length; j++) {
      this.logRegistry[j].active = select;
    }
  }
}
