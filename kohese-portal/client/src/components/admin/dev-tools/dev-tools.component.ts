import { Component, OnInit } from '@angular/core';
import { LogService } from '../../../services/log/log.service';

@Component({
  selector: 'app-dev-tools',
  templateUrl: './dev-tools.component.html',
  styleUrls: ['./dev-tools.component.css']
})
export class DevToolsComponent implements OnInit {
  logEvents: any;
  selectedLogEvents: any;

  constructor(private logService: LogService) { }

  ngOnInit() {
    this.logEvents = this.logService.getLogEvents();
    this.logEvents = Object.keys(this.logEvents.map((key) => {
      return [this.logEvents[key]]
    })
    )

    this.logService.getLogEventsSubscription().subscribe((logEvents) => {
      this.selectedLogEvents = logEvents;
    })
  }

  saveLogSelections() {
    this.logService.saveLogEventsSubscription(this.selectedLogEvents);
  }
}
