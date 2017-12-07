import { Injectable } from '@angular/core'
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { Observable } from 'rxjs/Observable';
import { ScalarObservable } from 'rxjs/observable/ScalarObservable';
import { of } from 'rxjs/observable/of';

@Injectable()
export class UserService implements OnInit {
  constructor() {

  }

  ngOnInit() {
    console.log('User Service initialized');
  }

  getUsersItemId () {

  }

  getAllUsers () {

  }

  getCurrentUsername (): ScalarObservable<string> {
    return new ScalarObservable('admin');
  }

  getCurrentUserEmail (): ScalarObservable<string> {
    return new ScalarObservable('admin@admin.com');
  }

  setCurrentUser () {

  }

}
