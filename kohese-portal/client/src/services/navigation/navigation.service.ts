import { Injectable } from '@angular/core';

import { NavigationUpdate } from './NavigationUpdate.class';
import { Subject } from 'rxjs/Subject';
import { Router } from '@angular/router';

import { LocationMap } from '../../constants/LocationMap.data'

@Injectable()

export class NavigationService {
  navUpdates : Subject<NavigationUpdate>;
  routeBase: string;

  constructor(private router : Router) {
    this.navUpdates = new Subject<NavigationUpdate>();
    this.routeBase = 'http://localhost:3000'
  }

  getNavUpdates(): Subject<NavigationUpdate> {
    return this.navUpdates;
  }

  navigate(location: string, params: object) {
    let newNavUpdate = new NavigationUpdate(location, params);
    this.navUpdates.next(newNavUpdate);
    this.router.navigate([LocationMap[location].route, params])
  }

  addTab(location: string, params : object) {
    console.log(LocationMap[location]);
    console.log(params);
    let routeInfo = LocationMap[location];
    let route = this.routeBase;
    route += routeInfo.route;
    if (params) {
      for (let param in params) {
        route += ';' + params[param];
      }
    }
    let newTab = window.open(route);
  }
}
