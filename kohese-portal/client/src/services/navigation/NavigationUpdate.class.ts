import { Injectable } from '@angular/core';

@Injectable()
export class NavigationUpdate {
  location : string;
  params : object;
  tabID : number

  constructor (location : string,
               params : object,
               tabID : number ) {
    this.location = location;
    this.params = params;
    this.tabID = tabID;
  }
}
