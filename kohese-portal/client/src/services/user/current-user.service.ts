import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class CurrentUserService {
  currentUserSubject : BehaviorSubject<any>;
  credentialSubscription : BehaviorSubject<{command: string, credentials : object}>;
  isAuthenticated : boolean;

  constructor() {
    this.isAuthenticated = false;
    this.currentUserSubject = new BehaviorSubject(undefined);
    this.credentialSubscription = new BehaviorSubject(undefined);
  }

  getCurrentUserSubject () : BehaviorSubject<any> {
    return this.currentUserSubject;
  }

  setCurrentUser (updatedUser : any) : BehaviorSubject<any>{
    this.currentUserSubject.next(updatedUser);
    return this.currentUserSubject;
  }

  getCredentialSubscription () : BehaviorSubject<any> {
    return this.credentialSubscription;
  }

  login (credentials: any)  {
    this.credentialSubscription.next({command : 'login', credentials : credentials})
  }

  logout ( ) {
    this.credentialSubscription.next({command : 'logout', credentials: {}})
  }
}