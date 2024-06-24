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


// Angular
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormControl } from '@angular/forms';
import { TooltipPosition } from '@angular/material/tooltip/tooltip';

// Other External Dependencies

// Kohese
import { LoggingEventRecord } from './../../../../../common/src/k-logger';
import { LogService } from '../../../services/log/log.service';

@Component({
  selector: 'app-dev-tools',
  templateUrl: './dev-tools.component.html',
  styleUrls: ['./dev-tools.component.scss']
})
export class DevToolsComponent implements OnInit {
  logRegistry : Array<LoggingEventRecord>;

  constructor(
    private logService : LogService,
    private title : Title
    ) {
      this.title.setTitle('Dev Tools');
    }

  ngOnInit() {
    this.logRegistry = this.logService.getLogEvents();

    // Eventually add some subscriptions that will validate the save went through or listen for new log registries
  }

  saveLogSelections() {
    this.logService.updateLogRegistry(this.logRegistry);
  }

  positionOptions: TooltipPosition[] = ['after', 'before', 'above', 'below', 'left', 'right'];
  position = new FormControl(this.positionOptions[3]);
  showDelay = new FormControl(1500);
  hideDelay = new FormControl(0);

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
