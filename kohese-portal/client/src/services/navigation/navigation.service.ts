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
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

// Other External Dependencies

// Kohese
import { NavigationUpdate } from './NavigationUpdate.class';
import { LocationMap } from '../../constants/LocationMap.data'

@Injectable()

export class NavigationService {
  navUpdates : Subject<NavigationUpdate>;
  routeBase: string;

  constructor(private router : Router) {
    this.navUpdates = new Subject<NavigationUpdate>();
    this.routeBase = window.location.protocol + "//" + window.location.host;
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
    let routeInfo = LocationMap[location];
    let route = this.routeBase;
    route += routeInfo.route;
    if (params) {
      for (let param in params) {
        route += ';' + param + '=' + params[param];
      }
    }
    let newTab = window.open(route);
  }
}
