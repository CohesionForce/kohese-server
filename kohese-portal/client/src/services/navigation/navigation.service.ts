import { Injectable } from '@angular/core';

import { NavigationUpdate } from './NavigationUpdate.class';
import { Subject } from 'rxjs/Subject';
import { Router } from '@angular/router';

import { LocationMap } from '../../constants/LocationMap.data'

@Injectable()

export class NavigationService {
  navUpdates : Subject<NavigationUpdate>;

  constructor(private router : Router) {
    this.navUpdates = new Subject<NavigationUpdate>();
  }

  getNavUpdates (): Subject<NavigationUpdate> {

    return this.navUpdates;
  }

  navigate(location : string, params: object, id : number ) {
    let newNavUpdate = new NavigationUpdate(location, params, id);
    this.navUpdates.next(newNavUpdate);
    console.log(LocationMap[location]);
    this.router.navigate([LocationMap[location].route])

  }
}
