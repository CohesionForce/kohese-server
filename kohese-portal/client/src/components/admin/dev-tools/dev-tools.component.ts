import { Component, OnInit, AfterViewInit } from '@angular/core';
import { LogService } from '../../../services/log/log.service';

@Component({
  selector: 'app-dev-tools',
  templateUrl: './dev-tools.component.html',
  styleUrls: ['./dev-tools.component.scss']
})
export class DevToolsComponent implements OnInit, AfterViewInit {
  logEvents = [];
  selectedLogEvents: any;

  constructor(private logService: LogService) { }

  ngOnInit() {
    let allLogEvents = this.logService.getLogEvents();
    let logKeys = Object.keys(allLogEvents)
    let logArray = [];
    for (let key of logKeys) {
      this.logEvents.push(allLogEvents[key])
    }

    this.logService.getLogEventsSubscription().subscribe((logEvents) => {
      this.selectedLogEvents = logEvents;
      console.log(this.selectedLogEvents);
    })
  }

  ngAfterViewInit () {
    this.logService.getLogEventsSubscription().subscribe((logEvents) => {
      this.selectedLogEvents = logEvents;
      console.log(this.selectedLogEvents);
    })
  }

  saveLogSelections() {
    console.log(this.selectedLogEvents);
    this.logService.saveLogEventsSubscription(this.selectedLogEvents);
  }
}
