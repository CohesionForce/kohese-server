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
  selectedLogEvents = {};

  constructor(private logService: LogService) { }

  ngOnInit() {
    this.logRegistry = this.logService.getLogEvents();

    // Eventually add some subscriptions that will validate the save went through or listen for new log registries
  }

  saveLogSelections() {
    console.log(this.selectedLogEvents);
    this.logService.updateLogRegistry(this.logRegistry);
  }

  selectEvent(logEvent : any) {
    logEvent.active = !logEvent.active;
  }
}
