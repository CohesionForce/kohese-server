import { Tab } from '../tab-service/Tab.class';
import { Injectable, OnInit } from '@angular/core';
import * as _ from 'underscore';

@Injectable()
export class BundleService implements OnInit {
  bundler: Array<any>;

  constructor () {

  }

  ngOnInit () {

  }

  bundleComponent (component: any, type: string, tabId: number): void {
    let bundle = this.bundler[tabId];
    bundle.components[type] = component;
  }

  restoreComponentData(tabId: number, type: string, toComponent): boolean {
    let bundlerPosition = this.bundler[tabId];
    if (bundlerPosition) {
      let fromComponent = bundlerPosition.components[type];
      if (fromComponent) {
        for (let key in fromComponent) {
          if (fromComponent.hasOwnProperty(key) && key.charAt(0) !== '$'
              && !_.isEqual(fromComponent[key], toComponent[key])) {
                toComponent[key] = fromComponent[key]
              }
        }
        return true;
      }
    }
    return false;
  }

  /* TODO - Assess if this is still needed  */
  updateState (newState: string, tabId: number): void {
    let bundle = this.bundler[tabId];
    bundle.lastState = bundle.currentState;
    bundle.currentState = newState;
  }

  getLastState (tabId: number): any {
    return this.bundler[tabId].lastState;
  }

  getCurrentState (tabId: number): any {
    return this.bundler[tabId].currentState;
  }
}
