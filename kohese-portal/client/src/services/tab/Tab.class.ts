import { Subject } from "rxjs/Subject";
import { NavigationUpdate } from "../navigation/NavigationUpdate.class";

import { LocationMap } from '../../constants/LocationMap.data';

export class Tab {
  title: string;
  route: string;
  type: string;
  id: number;
  params: Object;
  position: number;

  navUpdates : Subject<NavigationUpdate>;

  constructor (location: string, params: Object, id: number,
               position: number, navUpdates : Subject<NavigationUpdate>) {
    this.title = LocationMap[location].title;
    this.route = LocationMap[location].route;
    this.type = LocationMap[location].type;
    this.params = params;
    this.id = id;
    this.position = position;
    this.navUpdates = navUpdates;
    this.navUpdates
      .filter(update => update.tabID == this.id)
      .subscribe(update => {
      this.route = LocationMap[update.location].route;
      this.title = LocationMap[update.location].title;
      this.type = LocationMap[update.location].type;
      this.params = params;
    });

  }

  destroy() {
    this.navUpdates.unsubscribe();
  }
}
