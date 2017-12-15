import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class AuthTokenFactory {
  private token: BehaviorSubject<string> = new BehaviorSubject('');
  
  constructor() {
  }
  
  getToken(): BehaviorSubject<string> {
    return this.token;
  }
  
  setToken(t: string) {
    this.token.next(t);
  }
}