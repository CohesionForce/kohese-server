import { Injectable } from '@angular/core';

import { NavigationUpdate } from './NavigationUpdate.class';
import { Subject } from 'rxjs/Subject';
import { Router } from '@angular/router';

@Injectable()

export class NavigationService {
  navUpdates : Subject<NavigationUpdate>;

  constructor(private router : Router) {
    this.navUpdates = new Subject<NavigationUpdate>();
  }

  getNavUpdates (): Subject<NavigationUpdate> {

    return this.navUpdates;
  }

  navigate(route : string, params: object, id : number ) {
    let newNavUpdate = new NavigationUpdate(route, params, id);
    this.navUpdates.next(newNavUpdate);

  }
}
