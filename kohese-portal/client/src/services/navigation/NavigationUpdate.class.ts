import { Injectable } from '@angular/core';

@Injectable()
export class NavigationUpdate {
  private location: string;
  private params: object;

  constructor(location: string, params: object) {
    this.location = location;
    this.params = params;
  }
}
