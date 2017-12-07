import { Injectable } from '@angular/core'
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';

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

  getCurrentUsername () {
    return 'admin';
  }

  getCurrentUserEmail () {

  }

  setCurrentUser () {

  }

}
