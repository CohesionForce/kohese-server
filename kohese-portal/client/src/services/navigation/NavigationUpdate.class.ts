import { Injectable } from '@angular/core';

@Injectable()
export class NavigationUpdate {
  route : string;
  params : object;
  tabID : number

  constructor (route : string,
               params : object,
               tabID : number ) {
    this.route = route;
    this.params = params;
    this.tabID = tabID;
  }
}
