import * as _ from 'underscore';
import { Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

import { Bundle } from './bundle.class';
import 'rxjs/add/operator/filter';


@Injectable()
export class BundleService {
  bundler: Array<any>;

  constructor (private router: Router,
               private activatedRouter: ActivatedRoute) {
    this.onInit();
    this.bundler = [];
  }

  onInit () {
    console.log('Bundle.service init')
    this.router.events
      .filter((event) => event instanceof NavigationEnd)
      .subscribe((event) => this.updateBundle())
  }

  bundleComponent (component: any, type: string, tabId: number): void {
    let bundle = this.bundler[tabId];
    bundle.components[type] = component;
  }

  updateBundle (): void {
    console.log('Update Bundle');
    let currentBundle = this.bundler[0]; // TODO - Update to new currenttab logic
    if (currentBundle) {
      currentBundle.lastState = currentBundle.currentState;
    } else {
      currentBundle = new Bundle();
    }
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
