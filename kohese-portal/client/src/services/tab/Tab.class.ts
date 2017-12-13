import { Subject } from "rxjs/Subject";
import { NavigationUpdate } from "../navigation/NavigationUpdate.class";

export class Tab {
  title: string;
  type: string;
  route: string;
  id: number;
  params: Object;
  position: number;

  navUpdates : Subject<NavigationUpdate>;

  constructor (title: string, route: string, params: Object, id: number,
               position: number, navUpdates : Subject<NavigationUpdate>) {
    this.title = title;
    this.params = params;
    this.id = id;
    this.route = route;
    this.position = position;
    this.navUpdates = navUpdates;
    this.navUpdates
      .filter(update => update.tabID == this.id)
      .subscribe(update => {
      this.route = route;
      this.params = params;
    });

  }

  destroy() {
    this.navUpdates.unsubscribe();
  }
}
